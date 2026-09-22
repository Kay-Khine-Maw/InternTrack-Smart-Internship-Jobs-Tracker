import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/server/demoUser";
import { findDuplicateInternship } from "@/lib/server/duplicates";
import { AppError, databaseError, isAppError } from "@/lib/server/errors";
import { parseOptionalDate, toClientInternship, toDbPriority, toDbStatus } from "@/lib/server/mapInternship";
import { parseTranslations } from "@/lib/translations";
import { readInternshipExtras, writeHrEmail, writeTranslations } from "@/lib/server/translationsDb";
import type { InternshipStatus, Priority } from "@/lib/types";

const createSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required."),
  position: z.string().trim().min(1, "Position is required."),
  location: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  requiredDocuments: z
    .array(z.object({ name: z.string().trim().min(1), completed: z.boolean().optional() }))
    .optional()
    .default([]),
  tags: z.array(z.string()).optional().default([]),
  applicationUrl: z.string().optional().nullable(),
  hrEmail: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["saved", "preparing", "applied", "interview", "accepted", "rejected"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  extractionHistoryId: z.string().optional().nullable(),
  addAnyway: z.boolean().optional(),
  translations: z.unknown().optional(),
});

function jsonError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      { message: error.message, code: error.code, existingId: (error as AppError & { existingId?: string }).existingId },
      { status: error.status }
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid internship data.", code: "VALIDATION" }, { status: 400 });
  }
  const mapped = databaseError(error);
  return NextResponse.json({ message: mapped.message, code: mapped.code }, { status: mapped.status });
}

export async function GET() {
  try {
    const user = await getDemoUser();
    const rows = await prisma.internship.findMany({
      where: { userId: user.id },
      include: { documents: true, tags: true },
      orderBy: { createdAt: "desc" },
    });
    const extras = await readInternshipExtras(rows.map((row) => row.id));
    return NextResponse.json({
      internships: rows.map((row) => ({
        ...toClientInternship(row),
        translations: extras[row.id]?.translations ?? {},
        hrEmail: extras[row.id]?.hrEmail ?? (row as { hrEmail?: string | null }).hrEmail ?? undefined,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());
    const user = await getDemoUser();

    if (!body.addAnyway) {
      const match = await findDuplicateInternship({
        sourceUrl: body.sourceUrl,
        applicationUrl: body.applicationUrl,
        companyName: body.companyName,
        position: body.position,
      });
      if (match) {
        return NextResponse.json(
          {
            message: "This internship already exists in your tracker.",
            code: "DUPLICATE",
            existingId: match.duplicate.id,
            existing: match.internship,
            duplicate: match.duplicate,
          },
          { status: 409 }
        );
      }
    }

    const tags = await Promise.all(
      body.tags
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) =>
          prisma.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          })
        )
    );

    const row = await prisma.internship.create({
      data: {
        companyName: body.companyName,
        position: body.position,
        location: body.location || null,
        deadline: parseOptionalDate(body.deadline),
        description: body.description || null,
        requirements: body.requirements,
        skills: body.skills,
        applicationUrl: body.applicationUrl || null,
        sourceUrl: body.sourceUrl || null,
        notes: body.notes || null,
        status: toDbStatus(body.status as InternshipStatus) ?? "SAVED",
        priority: toDbPriority(body.priority as Priority) ?? "MEDIUM",
        userId: user.id,
        documents: {
          create: body.requiredDocuments.map((doc) => ({
            name: doc.name,
            completed: Boolean(doc.completed),
          })),
        },
        tags: { connect: tags.map((tag) => ({ id: tag.id })) },
      },
      include: { documents: true, tags: true },
    });

    if (body.extractionHistoryId) {
      await prisma.extractionHistory.updateMany({
        where: { id: body.extractionHistoryId },
        data: { internshipId: row.id },
      });
    }

    const translations = parseTranslations(body.translations);
    await writeTranslations(row.id, translations);
    await writeHrEmail(row.id, body.hrEmail ?? null);
    return NextResponse.json(
      { internship: { ...toClientInternship(row), translations, hrEmail: body.hrEmail?.trim() || null } },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

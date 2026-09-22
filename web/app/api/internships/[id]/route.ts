import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/server/demoUser";
import { AppError, databaseError, isAppError } from "@/lib/server/errors";
import { parseOptionalDate, toClientInternship, toDbPriority, toDbStatus } from "@/lib/server/mapInternship";
import { parseTranslations } from "@/lib/translations";
import { readInternshipExtras, writeHrEmail, writeTranslations } from "@/lib/server/translationsDb";
import type { InternshipStatus, Priority } from "@/lib/types";

const updateSchema = z.object({
  companyName: z.string().trim().min(1).optional(),
  company: z.string().trim().min(1).optional(),
  position: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  location: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  applicationUrl: z.string().optional().nullable(),
  hrEmail: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["saved", "preparing", "applied", "interview", "accepted", "rejected"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  tags: z.array(z.string()).optional(),
  documents: z
    .array(z.object({ id: z.string().optional(), name: z.string(), completed: z.boolean().optional() }))
    .optional(),
  applicationDate: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  interviewTime: z.string().optional().nullable(),
  interviewLink: z.string().optional().nullable(),
  preparationNotes: z.string().optional().nullable(),
  translations: z.unknown().optional(),
});

function jsonError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid internship data.", code: "VALIDATION" }, { status: 400 });
  }
  const mapped = databaseError(error);
  return NextResponse.json({ message: mapped.message, code: mapped.code }, { status: mapped.status });
}

async function loadOwned(id: string) {
  const user = await getDemoUser();
  const row = await prisma.internship.findFirst({
    where: { id, userId: user.id },
    include: { documents: true, tags: true },
  });
  if (!row) throw new AppError("NOT_FOUND", "Internship not found.", 404);
  return row;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const row = await loadOwned(params.id);
    const extras = (await readInternshipExtras([row.id]))[row.id];
    return NextResponse.json({
      internship: {
        ...toClientInternship(row),
        translations: extras?.translations ?? {},
        hrEmail: extras?.hrEmail ?? (row as { hrEmail?: string | null }).hrEmail ?? undefined,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await loadOwned(params.id);
    const body = updateSchema.parse(await request.json());
    const companyName = body.companyName ?? body.company;
    const position = body.position ?? body.role;
    const applicationUrl = body.applicationUrl ?? body.url;

    if (body.tags) {
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
      await prisma.internship.update({
        where: { id: params.id },
        data: { tags: { set: tags.map((tag) => ({ id: tag.id })) } },
      });
    }

    if (body.documents) {
      const keepIds = body.documents.map((doc) => doc.id).filter(Boolean) as string[];
      await prisma.document.deleteMany({
        where: { internshipId: params.id, id: { notIn: keepIds } },
      });
      for (const doc of body.documents) {
        if (doc.id) {
          await prisma.document.update({
            where: { id: doc.id },
            data: { name: doc.name, completed: Boolean(doc.completed) },
          });
        } else {
          await prisma.document.create({
            data: { internshipId: params.id, name: doc.name, completed: Boolean(doc.completed) },
          });
        }
      }
    }

    const row = await prisma.internship.update({
      where: { id: params.id },
      data: {
        ...(companyName ? { companyName } : {}),
        ...(position ? { position } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.deadline !== undefined ? { deadline: parseOptionalDate(body.deadline) } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.requirements ? { requirements: body.requirements } : {}),
        ...(body.skills ? { skills: body.skills } : {}),
        ...(applicationUrl !== undefined ? { applicationUrl } : {}),
        ...(body.sourceUrl !== undefined ? { sourceUrl: body.sourceUrl } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.status ? { status: toDbStatus(body.status as InternshipStatus) } : {}),
        ...(body.priority ? { priority: toDbPriority(body.priority as Priority) } : {}),
        ...(body.applicationDate !== undefined ? { applicationDate: parseOptionalDate(body.applicationDate) } : {}),
        ...(body.followUpDate !== undefined ? { followUpDate: parseOptionalDate(body.followUpDate) } : {}),
        ...(body.interviewDate !== undefined ? { interviewDate: parseOptionalDate(body.interviewDate) } : {}),
        ...(body.interviewTime !== undefined ? { interviewTime: body.interviewTime } : {}),
        ...(body.interviewLink !== undefined ? { interviewLink: body.interviewLink } : {}),
        ...(body.preparationNotes !== undefined ? { preparationNotes: body.preparationNotes } : {}),
      },
      include: { documents: true, tags: true },
    });

    if (body.translations !== undefined) {
      await writeTranslations(params.id, parseTranslations(body.translations));
    }
    if (body.hrEmail !== undefined) {
      await writeHrEmail(params.id, body.hrEmail);
    }
    const extras = (await readInternshipExtras([params.id]))[params.id];
    return NextResponse.json({
      internship: {
        ...toClientInternship(row),
        translations: extras?.translations ?? {},
        hrEmail: extras?.hrEmail ?? body.hrEmail ?? (row as { hrEmail?: string | null }).hrEmail ?? undefined,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await loadOwned(params.id);
    await prisma.internship.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

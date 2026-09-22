import { NextResponse } from "next/server";
import { z } from "zod";
import { getDemoUser } from "@/lib/server/demoUser";
import { AppError, databaseError, isAppError } from "@/lib/server/errors";
import { readOrCreateProfile, writeProfile } from "@/lib/server/profileDb";
import { toStudentProfile } from "@/lib/profile";

export const runtime = "nodejs";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name is required."),
  major: z.string().trim().min(1, "Major is required."),
  year: z.string().trim().min(1, "Year is required."),
  bio: z.string().optional().default(""),
  university: z.string().trim().min(1, "University is required."),
  email: z.string().trim().min(1, "Email is required."),
  location: z.string().trim().min(1, "Location is required."),
  preferredFields: z.array(z.string().trim().min(1)).default([]),
  preferredLocation: z.string().trim().min(1, "Preferred location is required."),
  skills: z.array(z.string().trim().min(1)).default([]),
  tools: z.array(z.string().trim().min(1)).default([]),
});

function jsonError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid profile data.", code: "VALIDATION" }, { status: 400 });
  }
  const mapped = databaseError(error);
  return NextResponse.json({ message: mapped.message, code: mapped.code }, { status: mapped.status });
}

export async function GET() {
  try {
    const user = await getDemoUser();
    const profile = await readOrCreateProfile(user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const parsed = profileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new AppError("VALIDATION", parsed.error.issues[0]?.message ?? "Invalid profile data.", 400);
    }
    const user = await getDemoUser();
    const profile = await writeProfile(user.id, toStudentProfile(parsed.data));
    return NextResponse.json({ profile });
  } catch (error) {
    return jsonError(error);
  }
}

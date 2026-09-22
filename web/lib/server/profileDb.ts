import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROFILE, toStudentProfile, type StudentProfile } from "@/lib/profile";

type ProfileRow = {
  displayName: string;
  major: string;
  year: string;
  bio: string | null;
  university: string;
  email: string;
  location: string;
  preferredFields: unknown;
  preferredLocation: string;
  skills: unknown;
  tools: unknown;
};

function rowToProfile(row: ProfileRow): StudentProfile {
  return toStudentProfile(row);
}

export async function readOrCreateProfile(userId: string): Promise<StudentProfile> {
  const existing = await prisma.$queryRawUnsafe<ProfileRow[]>(
    `SELECT "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools
     FROM "Profile" WHERE "userId" = $1 LIMIT 1`,
    userId
  );
  if (existing[0]) return rowToProfile(existing[0]);

  const created = rowToProfile(DEFAULT_PROFILE);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Profile" (id, "userId", "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools, "createdAt", "updatedAt")
     VALUES (concat('prf_', substr(md5(random()::text), 1, 20)), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, NOW(), NOW())`,
    userId,
    created.displayName,
    created.major,
    created.year,
    created.bio,
    created.university,
    created.email,
    created.location,
    JSON.stringify(created.preferredFields),
    created.preferredLocation,
    JSON.stringify(created.skills),
    JSON.stringify(created.tools)
  );
  return created;
}

export async function writeProfile(userId: string, profile: StudentProfile): Promise<StudentProfile> {
  const next = toStudentProfile(profile);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Profile" (id, "userId", "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools, "createdAt", "updatedAt")
     VALUES (concat('prf_', substr(md5(random()::text), 1, 20)), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb, NOW(), NOW())
     ON CONFLICT ("userId") DO UPDATE SET
       "displayName" = EXCLUDED."displayName",
       major = EXCLUDED.major,
       year = EXCLUDED.year,
       bio = EXCLUDED.bio,
       university = EXCLUDED.university,
       email = EXCLUDED.email,
       location = EXCLUDED.location,
       "preferredFields" = EXCLUDED."preferredFields",
       "preferredLocation" = EXCLUDED."preferredLocation",
       skills = EXCLUDED.skills,
       tools = EXCLUDED.tools,
       "updatedAt" = NOW()`,
    userId,
    next.displayName,
    next.major,
    next.year,
    next.bio,
    next.university,
    next.email,
    next.location,
    JSON.stringify(next.preferredFields),
    next.preferredLocation,
    JSON.stringify(next.skills),
    JSON.stringify(next.tools)
  );
  return next;
}

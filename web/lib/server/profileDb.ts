import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROFILE, toStudentProfile, type StudentProfile } from "@/lib/profile";

type ProfileRow = Record<string, unknown> & {
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

const profileColumns = `"displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools,
  "resumeSummary", "resumeContact", "resumeEducation", "resumeExperience", "resumeProjects", "resumeLanguages", "resumeLinks",
  "workArrangement", "relocationWillingness", "startAvailability", "internshipDuration", "profileVersion"`;

export async function readOrCreateProfile(userId: string): Promise<StudentProfile> {
  const existing = await prisma.$queryRawUnsafe<ProfileRow[]>(
    `SELECT ${profileColumns} FROM "Profile" WHERE "userId" = $1 LIMIT 1`,
    userId
  );
  if (existing[0]) return rowToProfile(existing[0]);

  const created = rowToProfile(DEFAULT_PROFILE);
  await writeProfile(userId, created);
  return created;
}

export async function writeProfile(userId: string, profile: StudentProfile): Promise<StudentProfile> {
  const next = toStudentProfile(profile);
  const result = await prisma.$queryRawUnsafe<ProfileRow[]>(
    `INSERT INTO "Profile" (id, "userId", "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools,
      "resumeSummary", "resumeContact", "resumeEducation", "resumeExperience", "resumeProjects", "resumeLanguages", "resumeLinks",
      "workArrangement", "relocationWillingness", "startAvailability", "internshipDuration", "profileVersion", "createdAt", "updatedAt")
     VALUES (concat('prf_', substr(md5(random()::text), 1, 20)), $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11::jsonb, $12::jsonb,
      $13, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb, $20, $21, $22, $23, 1, NOW(), NOW())
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
       "resumeSummary" = EXCLUDED."resumeSummary",
       "resumeContact" = EXCLUDED."resumeContact",
       "resumeEducation" = EXCLUDED."resumeEducation",
       "resumeExperience" = EXCLUDED."resumeExperience",
       "resumeProjects" = EXCLUDED."resumeProjects",
       "resumeLanguages" = EXCLUDED."resumeLanguages",
       "resumeLinks" = EXCLUDED."resumeLinks",
       "workArrangement" = EXCLUDED."workArrangement",
       "relocationWillingness" = EXCLUDED."relocationWillingness",
       "startAvailability" = EXCLUDED."startAvailability",
       "internshipDuration" = EXCLUDED."internshipDuration",
       "profileVersion" = "Profile"."profileVersion" + 1,
       "updatedAt" = NOW()
     RETURNING ${profileColumns}`,
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
    JSON.stringify(next.tools),
    next.resumeSummary,
    JSON.stringify(next.resumeContact),
    JSON.stringify(next.resumeEducation),
    JSON.stringify(next.resumeExperience),
    JSON.stringify(next.resumeProjects),
    JSON.stringify(next.resumeLanguages),
    JSON.stringify(next.resumeLinks),
    next.workArrangement || null,
    next.relocationWillingness,
    next.startAvailability || null,
    next.internshipDuration || null
  );
  return rowToProfile(result[0] ?? next);
}

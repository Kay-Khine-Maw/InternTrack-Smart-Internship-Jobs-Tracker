import "server-only";
import { prisma } from "@/lib/prisma";
import { parseTranslations, type InternshipTranslations } from "@/lib/translations";

export async function writeTranslations(id: string, translations: InternshipTranslations) {
  await prisma.$executeRawUnsafe(
    `UPDATE "Internship" SET translations = $1::jsonb WHERE id = $2`,
    JSON.stringify(translations ?? {}),
    id
  );
}

export async function writeHrEmail(id: string, hrEmail: string | null) {
  await prisma.$executeRawUnsafe(
    `UPDATE "Internship" SET "hrEmail" = $1 WHERE id = $2`,
    hrEmail?.trim() || null,
    id
  );
}

export async function readInternshipExtras(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {} as Record<string, { translations: InternshipTranslations; hrEmail: string | null }>;
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; translations: unknown; hrEmail: string | null }>>(
    `SELECT id, translations, "hrEmail" FROM "Internship" WHERE id = ANY($1::text[])`,
    unique
  );
  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      { translations: parseTranslations(row.translations), hrEmail: row.hrEmail ?? null },
    ])
  );
}

export async function readTranslations(id: string): Promise<InternshipTranslations> {
  return (await readInternshipExtras([id]))[id]?.translations ?? parseTranslations(null);
}

export async function readTranslationsMap(ids: string[]): Promise<Record<string, InternshipTranslations>> {
  const extras = await readInternshipExtras(ids);
  return Object.fromEntries(Object.entries(extras).map(([id, value]) => [id, value.translations]));
}

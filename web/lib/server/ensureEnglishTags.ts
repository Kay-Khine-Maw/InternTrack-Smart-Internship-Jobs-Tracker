import "server-only";

import { prisma } from "@/lib/prisma";
import { needsEnglishLabel, toEnglishShortLabels } from "@/lib/server/englishLabels";

/**
 * Rewrites internship tag links so stored Tag names are English.
 * Returns the English label list used for the response.
 */
export async function ensureEnglishInternshipTags(
  internshipId: string,
  currentNames: string[],
): Promise<string[]> {
  const cleaned = currentNames.map((name) => name.trim()).filter(Boolean).slice(0, 8);
  if (!cleaned.some((name) => needsEnglishLabel(name))) return cleaned;

  const englishNames = (await toEnglishShortLabels(cleaned))
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 8);

  const tags = await Promise.all(
    englishNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    ),
  );

  await prisma.internship.update({
    where: { id: internshipId },
    data: { tags: { set: tags.map((tag) => ({ id: tag.id })) } },
  });

  return englishNames;
}

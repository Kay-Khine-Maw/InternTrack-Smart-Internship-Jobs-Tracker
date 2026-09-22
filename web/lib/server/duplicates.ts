import "server-only";
import { prisma } from "@/lib/prisma";
import { findDuplicateRecord, toDuplicateInfo, type DuplicateCandidate } from "@/lib/duplicate-match";
import { getDemoUser } from "./demoUser";
import { toClientInternship } from "./mapInternship";

export async function findDuplicateInternship(
  input: DuplicateCandidate & { ignoreId?: string; urlOnly?: boolean }
) {
  const user = await getDemoUser();
  const rows = await prisma.internship.findMany({
    where: { userId: user.id },
    include: { documents: true, tags: true },
  });

  const match = findDuplicateRecord(rows, input, {
    ignoreId: input.ignoreId,
    urlOnly: input.urlOnly,
  });

  if (!match) return undefined;

  return {
    internship: toClientInternship(match),
    duplicate: toDuplicateInfo(match),
  };
}

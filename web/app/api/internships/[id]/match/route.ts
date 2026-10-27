import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import { readOrCreateProfile } from "@/lib/server/profileDb";
import { calculateMatch, matchingRequirementsFromLegacy, normalizeMatchingRequirements } from "@/lib/matching";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const row = await prisma.internship.findFirst({
      where: { id: params.id, userId: user.id },
      select: { matchingRequirements: true, requirements: true, skills: true },
    });
    if (!row) return NextResponse.json({ message: "Internship not found.", code: "NOT_FOUND" }, { status: 404 });
    const profile = await readOrCreateProfile(user.id);
    const storedRequirements = normalizeMatchingRequirements(row.matchingRequirements);
    const requirements = storedRequirements.length
      ? storedRequirements
      : matchingRequirementsFromLegacy(row.requirements, row.skills);
    return NextResponse.json({ match: calculateMatch(profile, requirements) });
  } catch {
    return NextResponse.json({ message: "Could not calculate the internship match.", code: "MATCH_FAILURE" }, { status: 500 });
  }
}

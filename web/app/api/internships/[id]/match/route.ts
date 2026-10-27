import { NextResponse } from "next/server";
import { getDemoUser } from "@/lib/server/demoUser";
import { prisma } from "@/lib/prisma";
import { readOrCreateProfile } from "@/lib/server/profileDb";
import { calculateMatch, type MatchingRequirement } from "@/lib/matching";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getDemoUser();
    const row = await prisma.internship.findFirst({
      where: { id: params.id, userId: user.id },
      select: { matchingRequirements: true },
    });
    if (!row) return NextResponse.json({ message: "Internship not found.", code: "NOT_FOUND" }, { status: 404 });
    const profile = await readOrCreateProfile(user.id);
    return NextResponse.json({ match: calculateMatch(profile, row.matchingRequirements as MatchingRequirement[]) });
  } catch {
    return NextResponse.json({ message: "Could not calculate the internship match.", code: "MATCH_FAILURE" }, { status: 500 });
  }
}

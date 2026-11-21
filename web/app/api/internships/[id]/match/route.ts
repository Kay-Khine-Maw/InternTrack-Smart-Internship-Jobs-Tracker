import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { prisma } from "@/lib/prisma";
import { readOrCreateProfile } from "@/lib/server/profileDb";
import { calculateMatch, matchingRequirementsFromLegacy, normalizeMatchingRequirements, type MatchResult } from "@/lib/matching";
import { combineMatchExplanation, matchExplanationChange, matchExplanationHash, matchExplanationSentences, matchExplanationSnapshot, readStoredMatchExplanation, type StoredMatchExplanation } from "@/lib/match-explanation";
import { smoothMatchFollowOn } from "@/lib/server/smoothMatchExplanation";
import { aiSkillGapRecommendations } from "@/lib/server/skillGapRecommendations";
import { toEnglishShortLabels } from "@/lib/server/englishLabels";
import { isAppError } from "@/lib/server/errors";
import type { SkillGapRecommendation } from "@/lib/skill-gap-recommendations";

export const runtime = "nodejs";

const SMOOTHER_UNAVAILABLE = "Smoother wording is unavailable.";

function wordingLines(match: MatchResult, labelMap?: Map<string, string>) {
  const localize = (label: string) => labelMap?.get(label) ?? label;
  return {
    matched: match.criteria
      .filter((item) => (item.category === "skill" || item.category === "tool") && item.result === "matched")
      .map((item) => ({
        label: localize(item.label),
        classification: item.classification,
        reason: item.match?.reason ?? "",
      })),
    notMet: match.skillMatch.toAcquire
      .filter((item) => item.category === "skill" || item.category === "tool")
      .map((item) => ({
        label: localize(item.label),
        classification: item.classification,
        reason: item.detail,
      })),
  };
}

async function englishLabelMap(labels: string[]) {
  const unique = Array.from(new Set(labels.map((label) => label.trim()).filter(Boolean)));
  const english = await toEnglishShortLabels(unique);
  const map = new Map<string, string>();
  unique.forEach((label, index) => {
    const next = english[index]?.trim();
    if (next) map.set(label, next);
  });
  return map;
}

async function saveMatchExplanation(id: string, userId: string, value: StoredMatchExplanation) {
  await prisma.$executeRawUnsafe(
    `UPDATE "Internship" SET "matchExplanationState" = $1::jsonb WHERE id = $2 AND "userId" = $3`,
    JSON.stringify(value),
    id,
    userId,
  );
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const row = await prisma.internship.findFirst({
      where: { id: params.id, userId: user.id },
      select: {
        matchingRequirements: true,
        requirements: true,
        skills: true,
        description: true,
        companyName: true,
        position: true,
      },
    });
    if (!row) return NextResponse.json({ message: "Internship not found.", code: "NOT_FOUND" }, { status: 404 });
    const profile = await readOrCreateProfile(user.id);
    const storedRequirements = normalizeMatchingRequirements(row.matchingRequirements);
    const requirements = storedRequirements.length
      ? storedRequirements
      : matchingRequirementsFromLegacy(row.requirements, row.skills);
    const match = calculateMatch(profile, requirements);
    if (match.state === "insufficient_requirements") return NextResponse.json({ match });
    const jobText = [row.companyName, row.position, row.description ?? ""].filter(Boolean).join("\n");
    const score = match.skillMatch.percentage;
    const snapshot = matchExplanationSnapshot(profile, requirements, score);
    const hash = matchExplanationHash(snapshot);
    const explanationRows = await prisma.$queryRawUnsafe<Array<{ matchExplanationState: unknown }>>(
      `SELECT "matchExplanationState" FROM "Internship" WHERE id = $1 AND "userId" = $2`,
      params.id,
      user.id,
    );
    const stored = readStoredMatchExplanation(explanationRows[0]?.matchExplanationState ?? null);
    const labelMap = score === null
      ? new Map<string, string>()
      : await englishLabelMap([
          ...match.skillMatch.matched.map((item) => item.label),
          ...match.skillMatch.toAcquire.map((item) => item.label),
        ]);
    const localizedMatch: MatchResult = {
      ...match,
      skillMatch: {
        ...match.skillMatch,
        matched: match.skillMatch.matched.map((item) => ({
          ...item,
          label: labelMap.get(item.label) ?? item.label,
        })),
        toAcquire: match.skillMatch.toAcquire.map((item) => ({
          ...item,
          label: labelMap.get(item.label) ?? item.label,
        })),
      },
    };
    const sentences = score === null ? null : matchExplanationSentences(localizedMatch, stored?.snapshot ?? null, snapshot);
    const first = sentences?.[0] ?? "";
    const fresh = sentences?.join(" ") ?? null;
    const sameInputs = stored?.hash === hash;
    let aiExplanation: string | null = null;
    let aiError: string | null = null;
    if (sameInputs && stored?.smoothed && (score === null ? stored.explanation === null : Boolean(first && stored.explanation?.startsWith(first)))) {
      aiExplanation = score === null ? null : stored.explanation;
    } else if (score === null || !fresh || !first) {
      aiExplanation = null;
      await saveMatchExplanation(params.id, user.id, { hash, explanation: null, snapshot, smoothed: true });
    } else {
      const source = sameInputs && stored?.explanation?.startsWith(first) ? stored.explanation : fresh;
      if (source.trim() === first) {
        aiExplanation = first;
        await saveMatchExplanation(params.id, user.id, { hash, explanation: first, snapshot, smoothed: true });
      } else {
        try {
          const lines = wordingLines(match, labelMap);
          const followOn = await smoothMatchFollowOn({
            percentage: score,
            firstSentence: first,
            matchedCount: match.skillMatch.matchedCount,
            comparedCount: match.skillMatch.comparedCount,
            matched: lines.matched,
            notMet: lines.notMet,
            inputChange: matchExplanationChange(source),
          });
          aiExplanation = combineMatchExplanation(first, followOn);
          await saveMatchExplanation(params.id, user.id, { hash, explanation: aiExplanation, snapshot, smoothed: true });
        } catch (error) {
          if (!isAppError(error) || error.code !== "AI_FAILURE") throw error;
          aiExplanation = source;
          aiError = SMOOTHER_UNAVAILABLE;
        }
      }
    }

    const displayedPercentage = score;
    const skillRequirements = requirements.filter((item) => item.category === "skill" || item.category === "tool");
    const missing = match.skillMatch.toAcquire.filter((item) => item.category === "skill" || item.category === "tool");
    let gapRecommendations: SkillGapRecommendation[] | null = null;
    let gapError: string | null = null;
    if (typeof displayedPercentage === "number") {
      if (missing.length === 0) {
        if (match.skillMatch.comparedCount > 0) gapRecommendations = [];
      } else {
        try {
          gapRecommendations = await aiSkillGapRecommendations({
            skills: profile.skills,
            tools: profile.tools,
            requirements: skillRequirements.map((item) => ({
              label: item.label,
              classification: item.classification,
              category: item.category,
            })),
            missing: missing.map((item) => ({
              label: item.label,
              classification: item.classification,
              category: item.category,
            })),
            jobContext: jobText,
          });
        } catch (error) {
          if (!isAppError(error) || error.code !== "AI_FAILURE") throw error;
          gapError = error.message;
        }
      }
    }

    return NextResponse.json({
      match: { ...match, score, aiExplanation, aiError, gapRecommendations, gapError },
    });
  } catch (error) {
    if (isAppError(error)) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ message: "Could not calculate the internship match.", code: "MATCH_FAILURE" }, { status: 500 });
  }
}

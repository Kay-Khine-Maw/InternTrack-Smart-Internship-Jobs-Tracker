import { createHash } from "node:crypto";
import { normalizeSkillKey, type MatchResult, type MatchingRequirement } from "@/lib/matching";
import type { StudentProfile } from "@/lib/profile";

export type MatchExplanationSnapshot = {
  skills: string[];
  tools: string[];
  requirements: string[];
  percentage: number | null;
};

export type StoredMatchExplanation = {
  hash: string;
  explanation: string | null;
  snapshot: MatchExplanationSnapshot;
  smoothed: boolean;
};

function uniqueLabels(values: string[]) {
  const byKey = new Map<string, string>();
  for (const value of values) {
    const label = value.trim();
    const key = normalizeSkillKey(label);
    if (!label || !key || byKey.has(key)) continue;
    byKey.set(key, label);
  }
  return Array.from(byKey.entries()).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)).map(([, label]) => label);
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function addedLabels(current: string[], previous: string[]) {
  const previousKeys = new Set(previous.map((label) => normalizeSkillKey(label)));
  return current.filter((label) => !previousKeys.has(normalizeSkillKey(label)));
}

function sameIdentity(previous: MatchExplanationSnapshot, current: MatchExplanationSnapshot) {
  const key = (labels: string[]) => labels.map((label) => normalizeSkillKey(label)).join("\n");
  return key(previous.skills) === key(current.skills)
    && key(previous.tools) === key(current.tools)
    && key(previous.requirements) === key(current.requirements);
}

function changeReason(previous: MatchExplanationSnapshot, current: MatchExplanationSnapshot) {
  const parts: string[] = [];
  const addedSkills = addedLabels(current.skills, previous.skills);
  const removedSkills = addedLabels(previous.skills, current.skills);
  const addedTools = addedLabels(current.tools, previous.tools);
  const removedTools = addedLabels(previous.tools, current.tools);
  const addedRequirements = addedLabels(current.requirements, previous.requirements);
  const removedRequirements = addedLabels(previous.requirements, current.requirements);
  if (addedSkills.length) parts.push(`you added ${joinList(addedSkills)} to your profile skills`);
  if (removedSkills.length) parts.push(`you removed ${joinList(removedSkills)} from your profile skills`);
  if (addedTools.length) parts.push(`you added ${joinList(addedTools)} to your profile tools`);
  if (removedTools.length) parts.push(`you removed ${joinList(removedTools)} from your profile tools`);
  if (addedRequirements.length) parts.push(`this posting added ${joinList(addedRequirements)}`);
  if (removedRequirements.length) parts.push(`this posting removed ${joinList(removedRequirements)}`);
  if (parts.length === 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  if (parts.length > 2) return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
  if (sameIdentity(previous, current)) return "";
  return "your profile or this posting's skill and tool requirements were updated";
}

export function matchExplanationSnapshot(
  profile: StudentProfile,
  requirements: MatchingRequirement[],
  percentage: number | null,
): MatchExplanationSnapshot {
  return {
    skills: uniqueLabels(profile.skills),
    tools: uniqueLabels(profile.tools),
    requirements: uniqueLabels(
      requirements
        .filter((item) => item.category === "skill" || item.category === "tool")
        .map((item) => item.label),
    ),
    percentage,
  };
}

export function matchExplanationHash(snapshot: MatchExplanationSnapshot) {
  return createHash("sha256")
    .update(JSON.stringify({
      skills: snapshot.skills,
      tools: snapshot.tools,
      requirements: snapshot.requirements,
      // Bust cached Thai-label explanations after English label localization.
      locale: "en-labels-v1",
    }))
    .digest("hex");
}

export function matchExplanationSentences(
  match: MatchResult,
  previous: MatchExplanationSnapshot | null,
  current: MatchExplanationSnapshot,
) {
  const percentage = match.skillMatch.percentage;
  if (percentage === null) return null;
  const { matchedCount, comparedCount, matched, toAcquire } = match.skillMatch;
  const matchedLabels = matched.map((item) => item.label);
  const missingLabels = toAcquire
    .filter((item) => item.category === "skill" || item.category === "tool")
    .map((item) => item.label);
  const noun = comparedCount === 1 ? "requirement" : "requirements";
  const verb = matchedCount === 1 ? "is" : "are";
  const sentences = [
    `This match is ${percentage}% because ${matchedCount} of ${comparedCount} skill and tool ${noun} on this posting ${verb} in your profile.`,
  ];
  if (matchedLabels.length) sentences.push(`In your profile: ${joinList(matchedLabels)}.`);
  if (missingLabels.length) sentences.push(`Not in your profile: ${joinList(missingLabels)}.`);
  if (previous) {
    const reason = changeReason(previous, current);
    if (reason) {
      if (typeof previous.percentage === "number" && previous.percentage !== percentage) {
        sentences.push(`This percentage changed from ${previous.percentage}% to ${percentage}% because ${reason}.`);
      } else if (previous.percentage === null) {
        sentences.push(`This percentage is available now because ${reason}.`);
      } else {
        sentences.push(`This percentage stayed ${percentage}% after ${reason}.`);
      }
    }
  }
  return sentences;
}

export function explainMatchPercentage(
  match: MatchResult,
  previous: MatchExplanationSnapshot | null,
  current: MatchExplanationSnapshot,
) {
  const sentences = matchExplanationSentences(match, previous, current);
  return sentences?.join(" ") ?? null;
}

export function matchExplanationChange(explanation: string) {
  const text = explanation.trim();
  const match = text.match(/(?:^|\s)(This percentage (?:changed from \d+% to \d+% because|is available now because|stayed \d+% after) [\s\S]*)$/);
  return match?.[1]?.trim() ?? "";
}

export function combineMatchExplanation(firstSentence: string, modelText: string | null | undefined) {
  const first = firstSentence.trim();
  let rest = (modelText ?? "").replace(/\s+/g, " ").trim();
  if (first && rest.startsWith(first)) rest = rest.slice(first.length).trim();
  if (/^This match is \d+% because\b/.test(rest)) {
    rest = rest.replace(/^This match is \d+% because\b[^.?!]*[.?!]?/, "").trim();
  }
  if (!rest) return first;
  return first ? `${first} ${rest}` : rest;
}

function stringList(value: unknown) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
  return value as string[];
}

export function readStoredMatchExplanation(value: unknown): StoredMatchExplanation | null {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  const snapshot = record.snapshot;
  if (!snapshot || typeof snapshot !== "object") return null;
  const stored = snapshot as Record<string, unknown>;
  const skills = stringList(stored.skills);
  const tools = stringList(stored.tools);
  const requirements = stringList(stored.requirements);
  if (typeof record.hash !== "string" || !skills || !tools || !requirements) return null;
  if (stored.percentage !== null && typeof stored.percentage !== "number") return null;
  if (record.explanation !== null && typeof record.explanation !== "string") return null;
  return {
    hash: record.hash,
    explanation: record.explanation,
    smoothed: record.smoothed === true,
    snapshot: {
      skills,
      tools,
      requirements,
      percentage: stored.percentage as number | null,
    },
  };
}

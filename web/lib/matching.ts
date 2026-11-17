import type { StudentProfile } from "@/lib/profile";
import type { SkillGapRecommendation } from "@/lib/skill-gap-recommendations";

export type MatchingRequirement = {
  label: string;
  category: "skill" | "tool" | "education" | "language" | "location" | "availability" | "other";
  classification: "required" | "preferred";
  sourceExcerpt?: string;
  mandatory?: boolean;
};

export type CriterionMatch = {
  profileValue: string;
  source: "skill" | "tool";
  reason: string;
};

export type CriterionResult = MatchingRequirement & {
  result: "matched" | "not_met" | "unknown" | "not_applicable";
  weight: number;
  match?: CriterionMatch;
};

export type MatchGap = {
  label: string;
  category: MatchingRequirement["category"];
  classification: "required" | "preferred";
  detail: string;
};

export type SkillMatchSummary = {
  percentage: number | null;
  matchedCount: number;
  comparedCount: number;
  emptyReason: "no_skill_requirements" | "unknown_only" | null;
  matched: Array<{ label: string; reason: string }>;
  toAcquire: MatchGap[];
  otherRequirements: MatchGap[];
  unknown: MatchGap[];
  unmentionedProfileSkills: string[];
};

export type MatchResult = {
  state: "ready" | "insufficient_requirements" | "complete_profile";
  score: number | null;
  coverage: number;
  criteria: CriterionResult[];
  mandatoryConditions: CriterionResult[];
  skillMatch: SkillMatchSummary;
  aiExplanation?: string | null;
  aiError?: string | null;
  gapRecommendations?: SkillGapRecommendation[] | null;
  gapError?: string | null;
  scoringVersion: string;
};

export function normalizeMatchingRequirements(value: unknown): MatchingRequirement[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const label = String(record.label ?? record.name ?? "").trim();
    if (!label) return [];
    const rawCategory = String(record.category ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
    const category =
      rawCategory === "skill" ||
      rawCategory === "technicalskill" ||
      rawCategory === "softskill" ||
      rawCategory === "competency" ||
      rawCategory === "requirement"
        ? "skill"
        : rawCategory === "tool" || rawCategory === "technology" || rawCategory === "tech"
          ? "tool"
          : rawCategory === "education" || rawCategory === "degree" || rawCategory === "qualification"
            ? "education"
            : rawCategory === "language" || rawCategory === "languages"
              ? "language"
              : rawCategory === "location" || rawCategory === "worklocation"
                ? "location"
                : rawCategory === "availability" || rawCategory === "startdate" || rawCategory === "duration"
                  ? "availability"
                  : "other";
    const rawClassification = String(record.classification ?? record.type ?? "").trim().toLowerCase();
    const classification = rawClassification === "preferred" || rawClassification === "nice to have"
      ? "preferred"
      : "required";
    return [{
      label,
      category,
      classification,
      ...(typeof record.sourceExcerpt === "string" ? { sourceExcerpt: record.sourceExcerpt } : {}),
      ...(typeof record.mandatory === "boolean" ? { mandatory: record.mandatory } : {}),
    }];
  });
}

export function matchingRequirementsFromLegacy(requirements: unknown, skills: unknown): MatchingRequirement[] {
  const legacyRequirements = Array.isArray(requirements) ? requirements : [];
  const legacySkills = Array.isArray(skills) ? skills : [];
  return normalizeMatchingRequirements([
    ...legacyRequirements.map((label) => ({
      label,
      category: "skill",
      classification: "required",
      mandatory: true,
    })),
    ...legacySkills.map((label) => ({
      label,
      category: "skill",
      classification: "preferred",
      mandatory: false,
    })),
  ]);
}

export const MATCH_WEIGHTS = {
  skill: 50,
  tool: 50,
  education: 10,
  location: 10,
  availability: 10,
  language: 5,
  other: 10,
} as const;

const aliases: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  "node.js": "node",
  nodejs: "node",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
};

function looseNormalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalize(value: string) {
  const key = looseNormalize(value);
  return aliases[key] ?? key;
}

export function normalizeSkillKey(value: string) {
  return normalize(value);
}

export function canonicalSkillLabel(candidate: string, labels: readonly string[]) {
  const key = normalize(candidate);
  if (!key) return null;
  for (const label of labels) {
    if (normalize(label) === key) return label;
  }
  return null;
}

function tokens(value: string) {
  return new Set(
    normalize(value)
      .split(" ")
      .filter(Boolean)
      .map((token) => (token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token))
  );
}

function matchesValue(label: string, value: string) {
  const requirementTokens = tokens(label);
  const profileTokens = tokens(value);
  if (!requirementTokens.size || !profileTokens.size) return false;
  const overlap = Array.from(requirementTokens).filter((token) => profileTokens.has(token)).length;
  return overlap === requirementTokens.size || overlap === profileTokens.size || (overlap >= 2 && overlap / Math.min(requirementTokens.size, profileTokens.size) >= 0.75);
}

function matchReason(requirementLabel: string, profileValue: string, source: "skill" | "tool") {
  const noun = source === "tool" ? "tool" : "skill";
  const requirementKey = looseNormalize(requirementLabel);
  const profileKey = looseNormalize(profileValue);
  const sameAfterNormalize = normalize(requirementLabel) === normalize(profileValue) && normalize(requirementLabel).length > 0;
  const aliased = (aliases[requirementKey] ?? requirementKey) !== requirementKey || (aliases[profileKey] ?? profileKey) !== profileKey;
  if (sameAfterNormalize && aliased) {
    return `Matches your ${noun} ${profileValue}. ${requirementLabel} and ${profileValue} are treated as the same ${noun}.`;
  }
  if (sameAfterNormalize) {
    return `Matches your ${noun} ${profileValue}.`;
  }
  return `Matches your ${noun} ${profileValue} because the wording overlaps with ${requirementLabel}.`;
}

function skillSources(profile: StudentProfile, category: "skill" | "tool") {
  const skills = profile.skills.filter(Boolean).map((value) => ({ value, source: "skill" as const }));
  const tools = profile.tools.filter(Boolean).map((value) => ({ value, source: "tool" as const }));
  return category === "tool" ? [...tools, ...skills] : [...skills, ...tools];
}

function findSkillMatch(label: string, sources: Array<{ value: string; source: "skill" | "tool" }>): CriterionMatch | null {
  for (const source of sources) {
    if (!matchesValue(label, source.value)) continue;
    return {
      profileValue: source.value,
      source: source.source,
      reason: matchReason(label, source.value, source.source),
    };
  }
  return null;
}

function requiredFirst<T extends { classification: "required" | "preferred" }>(items: T[]) {
  return [
    ...items.filter((item) => item.classification === "required"),
    ...items.filter((item) => item.classification === "preferred"),
  ];
}

function gap(item: CriterionResult, detail: string): MatchGap {
  return {
    label: item.label,
    category: item.category,
    classification: item.classification,
    detail,
  };
}

function requirementLevel(item: CriterionResult) {
  return item.classification === "preferred" ? "preferred" : "required";
}

const emptySkillMatch = (emptyReason: SkillMatchSummary["emptyReason"]): SkillMatchSummary => ({
  percentage: null,
  matchedCount: 0,
  comparedCount: 0,
  emptyReason,
  matched: [],
  toAcquire: [],
  otherRequirements: [],
  unknown: [],
  unmentionedProfileSkills: [],
});

function skillMatchSummary(profile: StudentProfile, criteria: CriterionResult[]): SkillMatchSummary {
  const skillCriteria = criteria.filter((item) => item.category === "skill" || item.category === "tool");
  const compared = skillCriteria.filter((item) => item.result === "matched" || item.result === "not_met");
  const matchedCriteria = compared.filter((item) => item.result === "matched");
  const percentage = compared.length ? Math.round((matchedCriteria.length / compared.length) * 100) : null;
  const seen = new Set<string>();
  const unmentionedProfileSkills: string[] = [];
  for (const value of [...profile.skills, ...profile.tools]) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalize(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!skillCriteria.some((item) => matchesValue(item.label, trimmed))) unmentionedProfileSkills.push(trimmed);
  }
  return {
    percentage,
    matchedCount: matchedCriteria.length,
    comparedCount: compared.length,
    emptyReason: skillCriteria.length === 0 ? "no_skill_requirements" : compared.length === 0 ? "unknown_only" : null,
    matched: matchedCriteria.map((item) => ({ label: item.label, reason: item.match?.reason ?? `Matches your profile entry ${item.match?.profileValue ?? item.label}.` })),
    toAcquire: requiredFirst(
      skillCriteria
        .filter((item) => item.result === "not_met")
        .map((item) => gap(item, `${item.label} — ${requirementLevel(item)} on this posting, not in your skills or tools.`))
    ),
    otherRequirements: requiredFirst(
      criteria
        .filter((item) => item.category !== "skill" && item.category !== "tool" && item.result === "not_met")
        .map((item) => gap(item, `${item.label} — ${requirementLevel(item)} on this posting, not found in your profile.`))
    ),
    unknown: criteria
      .filter((item) => item.result === "unknown")
      .map((item) => gap(item, `${item.label} — add this to your profile if you have it.`)),
    unmentionedProfileSkills,
  };
}

function profileValues(profile: StudentProfile, requirement: MatchingRequirement): string[] | null {
  switch (requirement.category) {
    case "skill": return [...profile.skills, ...profile.tools];
    case "tool": return [...profile.tools, ...profile.skills];
    case "education": return [profile.major, profile.university, ...profile.resumeEducation.flatMap((item) => [item.degree ?? "", item.major ?? "", item.school])];
    case "language": return profile.resumeLanguages.flatMap((item) => [item.language, item.proficiency ?? ""]);
    case "location": return [profile.location, profile.preferredLocation];
    case "availability": return [profile.internshipPeriod.start, profile.internshipPeriod.end];
    case "other":
      return [
        ...profile.skills,
        ...profile.tools,
        profile.resumeSummary,
        ...profile.resumeProjects.flatMap((item) => [item.name, item.summary ?? "", ...(item.technologies ?? [])]),
        ...profile.resumeExperience.flatMap((item) => [item.role ?? "", item.summary ?? ""]),
      ];
  }
}

export function calculateMatch(profile: StudentProfile, requirements: MatchingRequirement[]): MatchResult {
  const unique = Array.from(new Map(requirements.map((item) => [`${item.category}:${normalize(item.label)}:${item.classification}`, item])).values());
  if (!unique.length) {
    return {
      state: "insufficient_requirements",
      score: null,
      coverage: 0,
      criteria: [],
      mandatoryConditions: [],
      skillMatch: emptySkillMatch("no_skill_requirements"),
      scoringVersion: "v1",
    };
  }
  const categoryCounts = new Map<string, number>();
  for (const requirement of unique) categoryCounts.set(requirement.category, (categoryCounts.get(requirement.category) ?? 0) + 1);
  const criteria: CriterionResult[] = unique.map((requirement) => {
    const values = profileValues(profile, requirement);
    const skillMatch = requirement.category === "skill" || requirement.category === "tool"
      ? findSkillMatch(requirement.label, skillSources(profile, requirement.category))
      : null;
    const result = values === null || !values.some(Boolean)
      ? "unknown"
      : requirement.category === "skill" || requirement.category === "tool"
        ? skillMatch ? "matched" : "not_met"
        : values.some((value) => matchesValue(requirement.label, value))
          ? "matched"
          : "not_met";
    const weight = (MATCH_WEIGHTS[requirement.category] ?? MATCH_WEIGHTS.other) / (categoryCounts.get(requirement.category) ?? 1);
    return { ...requirement, result, weight, ...(skillMatch && result === "matched" ? { match: skillMatch } : {}) };
  });
  const applicableWeight = criteria.filter((item) => item.result !== "not_applicable").reduce((sum, item) => sum + item.weight, 0);
  const assessed = criteria.filter((item) => item.result === "matched" || item.result === "not_met");
  const assessedWeight = assessed.reduce((sum, item) => sum + item.weight, 0);
  const mandatoryConditions = criteria.filter((item) => item.mandatory || item.classification === "required");
  const skillMatch = skillMatchSummary(profile, criteria);
  return {
    state: assessedWeight ? "ready" : "complete_profile",
    score: skillMatch.percentage,
    coverage: applicableWeight ? Math.round((assessedWeight / applicableWeight) * 100) : 0,
    criteria,
    mandatoryConditions,
    skillMatch,
    scoringVersion: "v1",
  };
}

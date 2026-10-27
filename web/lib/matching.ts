import type { StudentProfile } from "@/lib/profile";

export type MatchingRequirement = {
  label: string;
  category: "skill" | "tool" | "education" | "language" | "location" | "availability" | "other";
  classification: "required" | "preferred";
  sourceExcerpt?: string;
  mandatory?: boolean;
};

export type CriterionResult = MatchingRequirement & {
  result: "matched" | "not_met" | "unknown" | "not_applicable";
  weight: number;
};

export type MatchResult = {
  state: "ready" | "insufficient_requirements" | "complete_profile";
  score: number | null;
  coverage: number;
  criteria: CriterionResult[];
  mandatoryConditions: CriterionResult[];
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

function normalize(value: string) {
  const key = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ");
  return aliases[key] ?? key;
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
    return { state: "insufficient_requirements", score: null, coverage: 0, criteria: [], mandatoryConditions: [], scoringVersion: "v1" };
  }
  const categoryCounts = new Map<string, number>();
  for (const requirement of unique) categoryCounts.set(requirement.category, (categoryCounts.get(requirement.category) ?? 0) + 1);
  const criteria: CriterionResult[] = unique.map((requirement) => {
    const values = profileValues(profile, requirement);
    const label = normalize(requirement.label);
    const result = values === null || !values.some(Boolean)
      ? "unknown"
      : values.some((value) => matchesValue(label, value))
        ? "matched"
        : "not_met";
    const weight = (MATCH_WEIGHTS[requirement.category] ?? MATCH_WEIGHTS.other) / (categoryCounts.get(requirement.category) ?? 1);
    return { ...requirement, result, weight };
  });
  const applicableWeight = criteria.filter((item) => item.result !== "not_applicable").reduce((sum, item) => sum + item.weight, 0);
  const assessed = criteria.filter((item) => item.result === "matched" || item.result === "not_met");
  const assessedWeight = assessed.reduce((sum, item) => sum + item.weight, 0);
  const matchedWeight = assessed.filter((item) => item.result === "matched").reduce((sum, item) => sum + item.weight, 0);
  const mandatoryConditions = criteria.filter((item) => item.mandatory || item.classification === "required");
  return {
    state: assessedWeight ? "ready" : "complete_profile",
    score: assessedWeight ? Math.round((matchedWeight / assessedWeight) * 100) : null,
    coverage: applicableWeight ? Math.round((assessedWeight / applicableWeight) * 100) : 0,
    criteria,
    mandatoryConditions,
    scoringVersion: "v1",
  };
}

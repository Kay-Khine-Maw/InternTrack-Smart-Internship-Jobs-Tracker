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
  const key = value.trim().toLowerCase().replace(/\s+/g, " ");
  return aliases[key] ?? key;
}

function profileValues(profile: StudentProfile, requirement: MatchingRequirement): string[] | null {
  switch (requirement.category) {
    case "skill": return profile.skills;
    case "tool": return profile.tools;
    case "education": return [profile.major, profile.university, ...profile.resumeEducation.flatMap((item) => [item.degree ?? "", item.major ?? "", item.school])];
    case "language": return profile.resumeLanguages.flatMap((item) => [item.language, item.proficiency ?? ""]);
    case "location": return [profile.location, profile.preferredLocation, profile.workArrangement];
    case "availability": return [profile.startAvailability, profile.internshipDuration];
    default: return null;
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
    const normalizedValues = values?.filter(Boolean).map(normalize) ?? [];
    const label = normalize(requirement.label);
    const result = values === null || !values.some(Boolean)
      ? "unknown"
      : normalizedValues.includes(label)
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

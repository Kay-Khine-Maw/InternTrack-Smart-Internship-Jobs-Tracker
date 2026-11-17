import { canonicalSkillLabel } from "@/lib/matching";

export type SkillGapLink = {
  label: string;
  url: string;
};

export type SkillGapRecommendation = {
  skill: string;
  reason: string;
  estimatedTime: string;
  howTo?: string;
  links?: SkillGapLink[];
};

export type SkillGapTarget = {
  label: string;
  classification: "required" | "preferred";
};

const PARSE_LIMIT = 16;
const MAX_ITEMS = 8;
const MAX_SKILL = 120;
const MAX_REASON = 240;
const MAX_TIME = 48;
const MAX_HOWTO = 500;
const MAX_LINKS = 3;
const MAX_LINK_LABEL = 80;
const MAX_LINK_URL = 500;

const UNIT_DAYS: Record<string, number> = {
  hour: 1 / 24,
  hours: 1 / 24,
  hr: 1 / 24,
  hrs: 1 / 24,
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanTime(value: unknown) {
  return clean(value, MAX_TIME).replace(/^estimates?:\s*/i, "");
}

function httpUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_LINK_URL || /\s/.test(trimmed) || !/^https?:\/\//i.test(trimmed)) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (!parsed.hostname) return "";
    return trimmed;
  } catch {
    return "";
  }
}

function linkLabel(value: unknown, url: string) {
  const label = clean(value, MAX_LINK_LABEL);
  if (label) return label;
  try {
    return new URL(url).hostname.replace(/^www\./i, "").slice(0, MAX_LINK_LABEL);
  } catch {
    return "";
  }
}

export function skillGapLinks(value: unknown): SkillGapLink[] {
  if (!Array.isArray(value)) return [];
  const links: SkillGapLink[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const url = httpUrl(record.url ?? record.href);
    if (!url) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    const label = linkLabel(record.label ?? record.name ?? record.title, url);
    if (!label) continue;
    seen.add(key);
    links.push({ label, url });
    if (links.length >= MAX_LINKS) break;
  }
  return links;
}

const COMMON_LEARNING_SITES: ReadonlyArray<{
  label: string;
  host: string;
  searchUrl: (skill: string) => string;
}> = [
  {
    label: "Coursera",
    host: "coursera.org",
    searchUrl: (skill) => `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
  },
  {
    label: "Udemy",
    host: "udemy.com",
    searchUrl: (skill) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`,
  },
  {
    label: "freeCodeCamp",
    host: "freecodecamp.org",
    searchUrl: (skill) => `https://www.freecodecamp.org/news/search?query=${encodeURIComponent(skill)}`,
  },
  {
    label: "LinkedIn Learning",
    host: "linkedin.com",
    searchUrl: (skill) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(skill)}`,
  },
];

function linkHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function sameLearningHost(hostname: string, siteHost: string) {
  return hostname === siteHost || hostname.endsWith(`.${siteHost}`);
}

export function withCommonLearningSites(skill: string, links: unknown): SkillGapLink[] {
  const combined = skillGapLinks(links);
  const skillName = clean(skill, MAX_SKILL);
  if (!skillName) return combined;
  for (const site of COMMON_LEARNING_SITES) {
    if (combined.some((link) => sameLearningHost(linkHostname(link.url), site.host))) continue;
    combined.push({ label: site.label, url: site.searchUrl(skillName) });
  }
  return combined;
}

function recommendationFrom(item: { skill: string; reason: string; estimatedTime: string; howTo?: string; links?: unknown }): SkillGapRecommendation {
  const howTo = clean(item.howTo, MAX_HOWTO);
  const links = skillGapLinks(item.links);
  const recommendation: SkillGapRecommendation = {
    skill: item.skill,
    reason: item.reason,
    estimatedTime: item.estimatedTime,
  };
  if (howTo) recommendation.howTo = howTo;
  if (links.length) recommendation.links = links;
  return recommendation;
}

function estimateDays(value: string) {
  const text = value.toLowerCase().replace(/[–—]/g, "-");
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:-|\bto\b)\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|days?|weeks?|months?|years?)\b/);
  if (range) {
    const unit = UNIT_DAYS[range[3]];
    if (unit) return ((Number(range[1]) + Number(range[2])) / 2) * unit;
  }
  const single = text.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|days?|weeks?|months?|years?)\b/);
  if (single) {
    const unit = UNIT_DAYS[single[2]];
    if (unit) return Number(single[1]) * unit;
  }
  if (/\ba couple of days\b/.test(text)) return 2;
  if (/\ba couple of weeks\b/.test(text)) return 14;
  if (/\ba few days\b/.test(text)) return 3;
  if (/\bseveral days\b/.test(text)) return 5;
  if (/\ba few weeks\b/.test(text)) return 21;
  if (/\bseveral weeks\b/.test(text)) return 28;
  if (/\ba few months\b/.test(text)) return 90;
  if (/\ba weekend\b/.test(text)) return 2;
  if (/\b(?:a|one) day\b/.test(text)) return 1;
  if (/\b(?:a|one) week\b/.test(text)) return 7;
  if (/\b(?:a|one) month\b/.test(text)) return 30;
  return null;
}

function recommendationList(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return null;
  const recommendations = (parsed as { recommendations?: unknown }).recommendations;
  return Array.isArray(recommendations) ? recommendations : null;
}

export function parseSkillGapRecommendations(text: string): SkillGapRecommendation[] | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  const list = recommendationList(parsed);
  if (!list) return null;

  const recommendations: SkillGapRecommendation[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const skill = clean(record.skill ?? record.name, MAX_SKILL);
    const reason = clean(record.reason ?? record.why, MAX_REASON);
    const estimatedTime = cleanTime(record.estimatedTime ?? record.time);
    if (!skill || !reason || !estimatedTime) continue;
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    recommendations.push(recommendationFrom({
      skill,
      reason,
      estimatedTime,
      howTo: typeof record.howTo === "string" ? record.howTo : undefined,
      links: record.links,
    }));
    if (recommendations.length >= PARSE_LIMIT) break;
  }

  if (list.length > 0 && recommendations.length === 0) return null;
  return recommendations;
}

export function alignSkillGapRecommendations(
  items: SkillGapRecommendation[],
  gaps: readonly SkillGapTarget[],
): SkillGapRecommendation[] {
  let remaining: SkillGapTarget[] = [
    ...gaps.filter((gap) => gap.classification === "required"),
    ...gaps.filter((gap) => gap.classification === "preferred"),
  ];
  const chosen: Array<SkillGapRecommendation & { classification: "required" | "preferred"; days: number | null; order: number }> = [];

  items.forEach((item, order) => {
    const match = remaining.find((gap) => canonicalSkillLabel(item.skill, [gap.label]) === gap.label);
    if (!match) return;
    remaining = remaining.filter((gap) => canonicalSkillLabel(gap.label, [match.label]) !== match.label);
    chosen.push({
      ...recommendationFrom(item),
      skill: match.label,
      classification: match.classification,
      days: estimateDays(item.estimatedTime),
      order,
    });
  });

  chosen.sort((left, right) => {
    const classDelta = Number(left.classification !== "required") - Number(right.classification !== "required");
    if (classDelta !== 0) return classDelta;
    const leftDays = left.days ?? Number.POSITIVE_INFINITY;
    const rightDays = right.days ?? Number.POSITIVE_INFINITY;
    if (leftDays !== rightDays) return leftDays - rightDays;
    return left.order - right.order;
  });

  return chosen.slice(0, MAX_ITEMS).map(({ skill, reason, estimatedTime, howTo, links }) => (
    recommendationFrom({ skill, reason, estimatedTime, howTo, links })
  ));
}

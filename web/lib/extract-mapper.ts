import type { DocumentItem, ExtractedInternshipData, ReviewDraft } from "@/lib/types";
import { normalizeMatchingRequirements } from "@/lib/matching";

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function coalesceText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return "";
    const lower = text.toLowerCase();
    if (lower === "null" || lower === "undefined" || lower === "n/a" || lower === "none") return "";
    return text;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    return value.map(coalesceText).filter(Boolean).join("\n").trim();
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["text", "value", "name", "city", "place", "location", "workplace", "description", "summary", "about"]) {
      const inner = coalesceText(record[key]);
      if (inner) return inner;
    }
    return Object.values(record).map(coalesceText).filter(Boolean).join(", ").trim();
  }
  return "";
}

function firstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = coalesceText(record[key]);
    if (value) return value;
  }
  return "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : item && typeof item === "object" && "name" in item ? asString((item as { name?: unknown }).name) : ""))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function isoDeadline(value: string) {
  if (!value) return "";
  const iso = value.match(/\d{4}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CONTACT_OR_SOCIAL_HOSTS = new Set([
  "twitter.com",
  "x.com",
  "instagram.com",
  "tiktok.com",
  "facebook.com",
  "fb.com",
  "t.me",
  "telegram.me",
  "wa.me",
  "api.whatsapp.com",
  "line.me",
]);

function looksLikePhone(text: string) {
  const digits = text.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 && !/[a-z]/i.test(text);
}

function looksLikeSocialHandle(text: string) {
  return /^@[\w.]+$/.test(text.trim());
}

function isSocialProfileUrl(parsed: URL) {
  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  const path = `${parsed.pathname}${parsed.search}`;
  if (/\b(jobs|careers|apply|internship)\b/i.test(path)) return false;
  if (host === "linkedin.com" && /^\/in\//i.test(parsed.pathname)) return true;
  return CONTACT_OR_SOCIAL_HOSTS.has(host);
}

export function sanitizeApplicationUrl(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return null;
  if (looksLikeSocialHandle(text)) return null;
  if (looksLikePhone(text)) return null;
  if (text.includes("@") && !/^https?:\/\//i.test(text)) return null;
  if (!/^https?:\/\//i.test(text)) return null;
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.includes(".")) return null;
    if (isSocialProfileUrl(parsed)) return null;
    return text;
  } catch {
    return null;
  }
}

export function extractEmailAddress(value: unknown): string | null {
  const text = asString(value).replace(/^mailto:/i, "");
  if (!text) return null;
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

export function splitApplicationContacts(applicationUrlRaw: unknown, hrEmailRaw?: unknown) {
  const applicationUrl = sanitizeApplicationUrl(applicationUrlRaw);
  let hrEmail = extractEmailAddress(hrEmailRaw);
  if (!applicationUrl) {
    hrEmail = hrEmail || extractEmailAddress(applicationUrlRaw);
  }
  return { applicationUrl, hrEmail };
}

export function unwrapExtractPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    const nested = obj.data as Record<string, unknown>;
    if (
      "companyName" in nested ||
      "company" in nested ||
      "position" in nested ||
      "role" in nested ||
      "location" in nested ||
      "description" in nested
    ) {
      return nested;
    }
  }
  return obj;
}

export function normalizeExtractedData(raw: unknown): ExtractedInternshipData {
  const obj = unwrapExtractPayload(raw);
  const contacts = splitApplicationContacts(
    firstString(obj, ["applicationUrl", "url", "applyUrl", "application_url"]),
    firstString(obj, ["hrEmail", "hr_email", "email", "contactEmail", "contact_email"])
  );
  return {
    companyName: firstString(obj, ["companyName", "company", "company_name"]) || null,
    position: firstString(obj, ["position", "role", "title", "jobTitle", "job_title"]) || null,
    location: firstString(obj, [
      "location",
      "loc",
      "city",
      "place",
      "workplace",
      "jobLocation",
      "job_location",
      "workLocation",
      "work_location",
      "officeLocation",
      "office",
    ]) || null,
    deadline: isoDeadline(firstString(obj, ["deadline", "applyBy", "applicationDeadline", "apply_by"])) || null,
    description: toRoleDescription(
      firstString(obj, [
        "description",
        "jobDescription",
        "job_description",
        "about",
        "summary",
        "overview",
        "roleDescription",
        "role_description",
        "details",
      ])
    ),
    requirements: asStringArray(obj.requirements ?? obj.requirement),
    requiredDocuments: asStringArray(
      obj.requiredDocuments ?? obj.documents ?? obj.required_documents
    ),
    applicationUrl: contacts.applicationUrl,
    hrEmail: contacts.hrEmail,
    skills: asStringArray(obj.skills ?? obj.tags),
    matchingRequirements: normalizeMatchingRequirements(obj.matchingRequirements),
  };
}

export function toReviewDraft(
  raw: unknown,
  extras?: { sourceUrl?: string; extractionHistoryId?: string; notes?: string; extractedText?: string }
): ReviewDraft {
  const data = normalizeExtractedData(raw);
  const documents: DocumentItem[] = (data.requiredDocuments ?? []).map((name, index) => ({
    id: `doc-${index}-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    completed: false,
  }));
  const notes = extras?.notes?.trim()
    || (!data.companyName && extras?.extractedText ? extras.extractedText.slice(0, 500) : "");
  return {
    companyName: data.companyName ?? "",
    position: data.position ?? "",
    location: data.location ?? "",
    deadline: data.deadline ?? "",
    description: data.description ?? "",
    requirements: data.requirements ?? [],
    documents,
    applicationUrl: data.applicationUrl ?? sanitizeApplicationUrl(extras?.sourceUrl) ?? "",
    hrEmail: data.hrEmail ?? "",
    skills: data.skills ?? [],
    sourceUrl: extras?.sourceUrl ?? "",
    notes,
    matchingRequirements: data.matchingRequirements,
    extractionHistoryId: extras?.extractionHistoryId,
  };
}

export function inferLocationFromText(text: string): string | null {
  const labeled = text.match(
    /(?:location|workplace|place of work|job location|city|สถานที่(?:ปฏิบัติงาน)?|ที่ตั้ง|จังหวัด|เขต)\s*[:\-]\s*([^\n,]+)/i
  )?.[1]?.trim();
  if (labeled) return labeled;
  const hint = text.match(/กรุงเทพฯ?|bangkok|chiang mai|เชียงใหม่|\bremote\b|\bhybrid\b/i)?.[0];
  return hint?.trim() || null;
}

const ROLE_HEADING =
  /^(about the role|the role|job description|responsibilities|key responsibilities|what you(?:'|’)ll do|your role|duties|role overview|หน้าที่(?:ความรับผิดชอบ)?|รายละเอียด(?:งาน|ตำแหน่ง)?)\b/i;
const STOP_HEADING =
  /^(qualifications|requirements|what you(?:'|’)ll need|benefits|perks|what we offer|compensation|how to apply|application process|process|คุณสมบัติ|สวัสดิการ|วิธีการสมัคร)\b/i;
const SKIP_HEADING =
  /^(about the company|about us|who we are|our story|why join|life at|เกี่ยวกับบริษัท|เกี่ยวกับเรา)\b/i;

function isSectionHeading(line: string, pattern: RegExp) {
  const heading = line.replace(/[:–—-]\s*$/, "").trim();
  return heading.length <= 80 && pattern.test(heading);
}

function isBenefitOrPitch(line: string) {
  return /\b(provident fund|health insurance|vacation leave|flexible fund|learning access|overseas outing|fun activities|compensation package|performance-based bonus|medical insurance|annual leave|we are one of|we offer a competitive|join us and be a part|don(?:'|’)t just follow trends)\b/i.test(
    line
  );
}

function descriptionLines(value: string) {
  return value.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.replace(/^[-•*]\s*/, "").trim();
    if (!trimmed) return [];
    if (trimmed.length > 240) {
      return trimmed
        .split(/(?<=[.!?])\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [trimmed];
  });
}

export function toRoleDescription(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const lines = descriptionLines(value);
  const alreadyEdited =
    lines.length > 0 &&
    lines.length <= 30 &&
    lines.join("\n").length <= 2500 &&
    lines.every(
      (line) =>
        !isSectionHeading(line, ROLE_HEADING) &&
        !isSectionHeading(line, SKIP_HEADING) &&
        !isSectionHeading(line, STOP_HEADING) &&
        !isBenefitOrPitch(line)
    );
  if (alreadyEdited) return lines.map((line) => `- ${line}`).join("\n");
  let mode: "seek" | "role" | "skip" = "seek";
  const selected: string[] = [];
  for (const line of lines) {
    if (isSectionHeading(line, ROLE_HEADING)) {
      if (mode !== "role") selected.length = 0;
      mode = "role";
      continue;
    }
    if (isSectionHeading(line, SKIP_HEADING) || isSectionHeading(line, STOP_HEADING)) {
      if (mode === "role") break;
      mode = "skip";
      continue;
    }
    if (mode === "skip" || isBenefitOrPitch(line) || line.length < 30) continue;
    if (/^(home|menu|cookie|privacy|apply now|sign in)$/i.test(line)) continue;
    selected.push(line);
  }
  const bullets = selected.slice(0, 8).map((line) => {
    if (line.length <= 180) return line;
    const cut = line.slice(0, 177).replace(/\s+\S*$/, "").trim();
    return `${cut || line.slice(0, 177).trim()}…`;
  });
  if (bullets.length) return bullets.map((line) => `- ${line}`).join("\n");
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= 320 && !isBenefitOrPitch(compact) && !/about the company/i.test(compact)) {
    return `- ${compact}`;
  }
  return null;
}

export function inferDescriptionFromText(text: string): string | null {
  return toRoleDescription(text);
}

export function hydrateFromSourceText(text: string, current: ExtractedInternshipData): ExtractedInternshipData {
  const next = { ...current };
  const pick = (pattern: RegExp) => text.match(pattern)?.[1]?.trim() || "";
  if (!next.companyName) next.companyName = pick(/(?:company|employer)\s*[:\-]\s*(.+)/i) || null;
  if (!next.position) next.position = pick(/(?:position|role|title)\s*[:\-]\s*(.+)/i) || null;
  if (!next.location) next.location = inferLocationFromText(text);
  if (!next.deadline) {
    const deadline = pick(/(?:deadline|apply by)\s*[:\-]\s*(.+)/i);
    next.deadline = isoDeadline(deadline) || null;
  }
  if (!next.description) next.description = inferDescriptionFromText(text);
  if (!next.hrEmail) next.hrEmail = extractEmailAddress(text);
  if (!next.applicationUrl) {
    const maybeUrl = pick(/(?:apply|application|website|url)\s*[:\-]\s*(\S+)/i);
    next.applicationUrl = sanitizeApplicationUrl(maybeUrl);
  }
  return next;
}

export function hasAnyExtractedField(data: ExtractedInternshipData) {
  return Boolean(
    data.companyName ||
      data.position ||
      data.location ||
      data.deadline ||
      data.description ||
      data.applicationUrl ||
      data.hrEmail ||
      data.requirements.length ||
      data.requiredDocuments.length ||
      data.skills.length
  );
}

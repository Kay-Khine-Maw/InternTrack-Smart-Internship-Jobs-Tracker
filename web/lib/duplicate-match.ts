import { normalizeUrl } from "./utils";

export type DuplicateInfo = {
  id: string;
  companyName: string;
  position: string;
  sourceUrl: string | null;
};

export type DuplicateCandidate = {
  sourceUrl?: string | null;
  applicationUrl?: string | null;
  companyName?: string | null;
  position?: string | null;
};

export type DuplicateRecord = {
  id: string;
  sourceUrl?: string | null;
  applicationUrl?: string | null;
  url?: string | null;
  companyName?: string | null;
  position?: string | null;
  company?: string | null;
  role?: string | null;
};

function recordCompany(row: DuplicateRecord) {
  return (row.companyName || row.company || "").trim();
}

function recordPosition(row: DuplicateRecord) {
  return (row.position || row.role || "").trim();
}

function recordUrls(row: DuplicateRecord) {
  return [row.sourceUrl, row.applicationUrl, row.url].map((value) => normalizeUrl(value)).filter(Boolean);
}

function candidateUrls(input: DuplicateCandidate) {
  return [input.sourceUrl, input.applicationUrl].map((value) => normalizeUrl(value)).filter(Boolean);
}

export function toDuplicateInfo(row: DuplicateRecord): DuplicateInfo {
  return {
    id: row.id,
    companyName: recordCompany(row),
    position: recordPosition(row),
    sourceUrl: row.sourceUrl || row.applicationUrl || row.url || null,
  };
}

export function isUrlDuplicate(input: DuplicateCandidate, row: DuplicateRecord) {
  const incoming = candidateUrls(input);
  if (incoming.length === 0) return false;
  const existing = recordUrls(row);
  return incoming.some((url) => existing.includes(url));
}

export function isTitleDuplicate(input: DuplicateCandidate, row: DuplicateRecord) {
  const company = input.companyName?.trim() ?? "";
  const position = input.position?.trim() ?? "";
  const otherCompany = recordCompany(row);
  const otherPosition = recordPosition(row);
  if (!company || !position || !otherCompany || !otherPosition) return false;
  return company.toLowerCase() === otherCompany.toLowerCase() && position.toLowerCase() === otherPosition.toLowerCase();
}

export function findDuplicateRecord<T extends DuplicateRecord>(
  records: T[],
  input: DuplicateCandidate,
  options?: { ignoreId?: string; urlOnly?: boolean }
): T | undefined {
  const list = records.filter((row) => !options?.ignoreId || row.id !== options.ignoreId);
  const urlMatch = list.find((row) => isUrlDuplicate(input, row));
  if (urlMatch) return urlMatch;
  if (options?.urlOnly) return undefined;
  return list.find((row) => isTitleDuplicate(input, row));
}

export function isEmptyExtractedValue(value: unknown) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

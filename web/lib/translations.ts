export const TRANSLATABLE_FIELDS = [
  "companyName",
  "position",
  "location",
  "description",
  "requirements",
  "skills",
  "notes",
  "documents",
] as const;

export type TranslatableField = (typeof TRANSLATABLE_FIELDS)[number];

export type FieldTranslation = {
  originalText: string;
  translatedText: string;
};

export type InternshipTranslations = Partial<Record<TranslatableField, FieldTranslation>>;

export function emptyTranslations(): InternshipTranslations {
  return {};
}

export function parseTranslations(value: unknown): InternshipTranslations {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const next: InternshipTranslations = {};
  for (const key of TRANSLATABLE_FIELDS) {
    const entry = (value as Record<string, unknown>)[key];
    if (!entry || typeof entry !== "object") continue;
    const originalText = String((entry as { originalText?: unknown; original?: unknown }).originalText
      ?? (entry as { original?: unknown }).original
      ?? "").trim();
    const translatedText = String((entry as { translatedText?: unknown; translated?: unknown }).translatedText
      ?? (entry as { translated?: unknown }).translated
      ?? "").trim();
    if (originalText && translatedText) {
      next[key] = { originalText, translatedText };
    }
  }
  return next;
}

export function upsertTranslation(
  current: InternshipTranslations,
  field: TranslatableField,
  entry: FieldTranslation
): InternshipTranslations {
  if (!entry.originalText.trim() || !entry.translatedText.trim()) return current;
  return { ...current, [field]: { originalText: entry.originalText.trim(), translatedText: entry.translatedText.trim() } };
}

export function displayTranslation(
  translations: InternshipTranslations | undefined,
  field: TranslatableField,
  original: string,
  view: "original" | "translated"
) {
  const entry = translations?.[field];
  if (view === "translated" && entry?.translatedText) return entry.translatedText;
  return original;
}

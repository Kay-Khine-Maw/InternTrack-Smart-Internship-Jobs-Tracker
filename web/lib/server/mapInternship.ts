import type { Internship, Priority, Document, Tag } from "@prisma/client";
import type { Internship as ClientInternship, Priority as ClientPriority } from "@/lib/types";
import { parseTranslations } from "@/lib/translations";

type Row = Internship & { documents: Document[]; tags: Tag[] };

const priorityToClient: Record<Priority, ClientPriority> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

const priorityToDb: Record<ClientPriority, Priority> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isoDate(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : undefined;
}

export function toClientInternship(row: Row): ClientInternship {
  return {
    id: row.id,
    company: row.companyName,
    role: row.position,
    url: row.applicationUrl ?? row.sourceUrl ?? undefined,
    location: row.location ?? undefined,
    deadline: isoDate(row.deadline) ?? null,
    notes: row.notes ?? undefined,
    documents: row.documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      completed: doc.completed,
    })),
    createdAt: row.createdAt.toISOString(),
    priority: priorityToClient[row.priority],
    matchingRequirements: Array.isArray((row as { matchingRequirements?: unknown }).matchingRequirements)
      ? (row as unknown as { matchingRequirements: import("@/lib/matching").MatchingRequirement[] }).matchingRequirements
      : [],
    tags: row.tags.map((tag) => tag.name),
    description: row.description ?? undefined,
    requirements: asStringArray(row.requirements),
    skills: asStringArray(row.skills),
    applicationUrl: row.applicationUrl ?? undefined,
    hrEmail: (row as Row & { hrEmail?: string | null }).hrEmail ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    applicationDate: isoDate(row.applicationDate),
    followUpDate: isoDate(row.followUpDate),
    interviewDate: isoDate(row.interviewDate),
    interviewTime: row.interviewTime ?? undefined,
    interviewLink: row.interviewLink ?? undefined,
    preparationNotes: row.preparationNotes ?? undefined,
    translations: parseTranslations((row as Row & { translations?: unknown }).translations),
  };
}

export function toDbPriority(priority?: ClientPriority) {
  return priority ? priorityToDb[priority] : undefined;
}

export function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

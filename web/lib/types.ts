export const INTERNSHIP_STATUSES = [
  "saved",
  "preparing",
  "applied",
  "interview",
  "accepted",
  "rejected",
] as const;

export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const STATUS_LABELS: Record<InternshipStatus, string> = {
  saved: "Saved",
  preparing: "Preparing",
  applied: "Applied",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const TIMELINE_STATUSES: InternshipStatus[] = [
  "saved",
  "preparing",
  "applied",
  "interview",
  "accepted",
];

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface DocumentItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  url?: string;
  location?: string;
  deadline: string | null;
  status: InternshipStatus;
  notes?: string;
  documents: DocumentItem[];
  createdAt: string;
  sourceText?: string;
  priority: Priority;
  tags: string[];
  description?: string;
  requirements?: string[];
  skills?: string[];
  applicationUrl?: string;
  hrEmail?: string;
  sourceUrl?: string;
  applicationDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  preparationNotes?: string;
  translations?: import("@/lib/translations").InternshipTranslations;
}

export interface ExtractedInternshipData {
  companyName: string | null;
  position: string | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string[];
  requiredDocuments: string[];
  applicationUrl: string | null;
  hrEmail: string | null;
  skills: string[];
}

export type { DuplicateInfo } from "@/lib/duplicate-match";
export type { FieldTranslation, InternshipTranslations, TranslatableField } from "@/lib/translations";

export interface ReviewDraft {
  companyName: string;
  position: string;
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
  documents: DocumentItem[];
  applicationUrl: string;
  hrEmail: string;
  skills: string[];
  sourceUrl: string;
  notes: string;
  extractionHistoryId?: string;
  translations?: import("@/lib/translations").InternshipTranslations;
}

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
  notes?: string;
  documents: DocumentItem[];
  createdAt: string;
  sourceText?: string;
  priority: Priority;
  matchingRequirements?: import("@/lib/matching").MatchingRequirement[];
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
  matchingRequirements?: import("@/lib/matching").MatchingRequirement[];
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
  matchingRequirements?: import("@/lib/matching").MatchingRequirement[];
}

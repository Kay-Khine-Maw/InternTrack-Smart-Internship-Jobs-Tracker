"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DocumentItem, Internship, InternshipStatus, Priority } from "./types";
import { findDuplicateRecord, toDuplicateInfo, type DuplicateCandidate, type DuplicateInfo } from "./duplicate-match";

interface InternshipContextValue {
  internships: Internship[];
  ready: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  addInternship: (payload: Record<string, unknown>) => Promise<Internship>;
  updateInternship: (id: string, patch: Partial<Internship>) => Promise<void>;
  deleteInternship: (id: string) => Promise<void>;
  toggleDocument: (internshipId: string, documentId: string) => Promise<void>;
  addDocument: (internshipId: string, name: string) => Promise<void>;
  removeDocument: (internshipId: string, documentId: string) => Promise<void>;
  setStatus: (
    id: string,
    status: InternshipStatus,
    extras?: Partial<
      Pick<
        Internship,
        | "applicationDate"
        | "followUpDate"
        | "interviewDate"
        | "interviewTime"
        | "interviewLink"
        | "preparationNotes"
      >
    >
  ) => Promise<void>;
  setPriority: (id: string, priority: Priority) => Promise<void>;
  getById: (id: string) => Internship | undefined;
  findByUrl: (url: string, ignoreId?: string) => Internship | undefined;
  findDuplicate: (input: DuplicateCandidate, options?: { ignoreId?: string; urlOnly?: boolean }) => DuplicateInfo | undefined;
}

const InternshipContext = createContext<InternshipContextValue | null>(null);

async function parseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(body?.message || `Request failed (${response.status})`);
}

export function InternshipProvider({ children }: { children: ReactNode }) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/internships");
    if (!response.ok) {
      await parseError(response);
    }
    const body = (await response.json()) as { internships: Internship[] };
    setInternships(body.internships);
    setLoadError(null);
  }, []);

  useEffect(() => {
    refresh()
      .catch((error: unknown) => {
        setInternships([]);
        setLoadError(error instanceof Error ? error.message : "Could not load internships from the database.");
      })
      .finally(() => setReady(true));
  }, [refresh]);

  const replace = useCallback((internship: Internship) => {
    setInternships((prev) => {
      const exists = prev.some((item) => item.id === internship.id);
      return exists ? prev.map((item) => (item.id === internship.id ? internship : item)) : [internship, ...prev];
    });
  }, []);

  const put = useCallback(async (id: string, patch: Record<string, unknown>) => {
    const response = await fetch(`/api/internships/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) await parseError(response);
    const body = (await response.json()) as { internship: Internship };
    replace(body.internship);
  }, [replace]);

  const value = useMemo<InternshipContextValue>(() => {
    return {
      internships,
      ready,
      loadError,
      refresh,
      addInternship: async (payload) => {
        const response = await fetch("/api/internships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await response.json().catch(() => null)) as {
          internship?: Internship;
          message?: string;
          existing?: Internship;
          existingId?: string;
          duplicate?: DuplicateInfo;
        } | null;
        if (response.status === 409) {
          const error = new Error(body?.message || "This internship already exists in your tracker.") as Error & {
            duplicate?: DuplicateInfo;
          };
          error.duplicate =
            body?.duplicate ??
            (body?.existing ? toDuplicateInfo(body.existing) : undefined);
          throw error;
        }
        if (!response.ok || !body?.internship) {
          throw new Error(body?.message || "Could not save the internship.");
        }
        replace(body.internship);
        return body.internship;
      },
      updateInternship: async (id, patch) => {
        await put(id, {
          companyName: patch.company,
          position: patch.role,
          location: patch.location,
          deadline: patch.deadline,
          description: patch.description,
          requirements: patch.requirements,
          skills: patch.skills,
          applicationUrl: patch.url ?? patch.applicationUrl,
          hrEmail: patch.hrEmail,
          sourceUrl: patch.sourceUrl,
          notes: patch.notes,
          status: patch.status,
          priority: patch.priority,
          tags: patch.tags,
          documents: patch.documents,
          applicationDate: patch.applicationDate,
          followUpDate: patch.followUpDate,
          interviewDate: patch.interviewDate,
          interviewTime: patch.interviewTime,
          interviewLink: patch.interviewLink,
          preparationNotes: patch.preparationNotes,
          translations: patch.translations,
        });
      },
      deleteInternship: async (id) => {
        const response = await fetch(`/api/internships/${id}`, { method: "DELETE" });
        if (!response.ok) await parseError(response);
        setInternships((prev) => prev.filter((item) => item.id !== id));
      },
      toggleDocument: async (internshipId, documentId) => {
        const current = internships.find((item) => item.id === internshipId);
        if (!current) return;
        await put(internshipId, {
          documents: current.documents.map((doc) =>
            doc.id === documentId ? { ...doc, completed: !doc.completed } : doc
          ),
        });
      },
      addDocument: async (internshipId, name) => {
        const current = internships.find((item) => item.id === internshipId);
        if (!current) return;
        await put(internshipId, {
          documents: [...current.documents, { name, completed: false }],
        });
      },
      removeDocument: async (internshipId, documentId) => {
        const current = internships.find((item) => item.id === internshipId);
        if (!current) return;
        await put(internshipId, {
          documents: current.documents.filter((doc) => doc.id !== documentId),
        });
      },
      setStatus: async (id, status, extras) => {
        await put(id, { status, ...extras });
      },
      setPriority: async (id, priority) => {
        await put(id, { priority });
      },
      getById: (id) => internships.find((item) => item.id === id),
      findByUrl: (url, ignoreId) => {
        return findDuplicateRecord(internships, { sourceUrl: url }, { ignoreId, urlOnly: true });
      },
      findDuplicate: (input, options) => {
        const match = findDuplicateRecord(internships, input, options);
        return match ? toDuplicateInfo(match) : undefined;
      },
    };
  }, [internships, ready, loadError, refresh, put, replace]);

  return <InternshipContext.Provider value={value}>{children}</InternshipContext.Provider>;
}

export function useInternships() {
  const ctx = useContext(InternshipContext);
  if (!ctx) throw new Error("useInternships must be used within InternshipProvider");
  return ctx;
}

export function documentProgress(documents: DocumentItem[]) {
  const completed = documents.filter((doc) => doc.completed).length;
  return { completed, total: documents.length };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { MatchResult } from "@/lib/matching";

export function MatchPanel({ internshipId }: { internshipId: string }) {
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/internships/${internshipId}/match`);
      const body = (await response.json()) as { match?: MatchResult; message?: string };
      if (!response.ok || !body.match) throw new Error(body.message || "Could not calculate the match.");
      setResult(body.match);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not calculate the match.");
    } finally {
      setLoading(false);
    }
  }, [internshipId]);

  useEffect(() => {
    let active = true;
    void load().finally(() => {
      if (!active) setResult(null);
    });
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <CardShell title="Profile match">
      {loading ? <p className="text-sm text-muted-foreground">Calculating assessed requirements...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {result?.state === "insufficient_requirements" ? (
        <p className="text-sm text-muted-foreground">Insufficient requirements. Review the internship requirements before matching.</p>
      ) : null}
      {result?.state === "complete_profile" ? (
        <p className="text-sm text-muted-foreground">Complete your profile to calculate this provisional match.</p>
      ) : null}
      {result?.state === "ready" ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-navy">{result.score}% <span className="text-sm font-normal text-muted-foreground">Provisional</span></p>
            <p className="text-right text-xs text-muted-foreground">Assessment coverage<br />{result.coverage}%</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">This percentage concerns assessed requirements and is not a hiring-success prediction.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.criteria.map((criterion) => (
              <div key={`${criterion.category}-${criterion.label}`} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-medium text-navy">{criterion.label}</p>
                <p className="text-xs capitalize text-muted-foreground">{criterion.result.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <button type="button" className="mt-4 text-xs font-medium text-accent-deep hover:underline" onClick={() => void load()}>
        Recalculate
      </button>
    </CardShell>
  );
}

function CardShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 font-semibold text-navy">{title}</h3>
      {children}
    </div>
  );
}

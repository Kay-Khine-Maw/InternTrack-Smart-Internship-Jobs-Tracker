"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { MatchResult, SkillMatchSummary } from "@/lib/matching";
import { withCommonLearningSites, type SkillGapLink, type SkillGapRecommendation } from "@/lib/skill-gap-recommendations";

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

  const skillMatch = result?.skillMatch;

  return (
    <CardShell title="Profile match">
      {loading ? <p className="text-sm text-muted-foreground">Calculating assessed requirements...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {result?.state === "insufficient_requirements" ? (
        <p className="text-sm text-muted-foreground">Insufficient requirements. Review the internship requirements before matching.</p>
      ) : null}
      {skillMatch && result?.state !== "insufficient_requirements" ? (
        <>
          <SkillMatchHeading
            percentage={skillMatch.percentage}
            skillMatch={skillMatch}
            showCount={!result.aiExplanation}
          />
          {result.aiExplanation ? <MatchExplanation explanation={result.aiExplanation} /> : null}
          {result.aiError ? <p className="mt-3 text-sm text-red-700">{result.aiError}</p> : null}
          <p className="mt-2 text-xs text-muted-foreground">This percentage concerns assessed requirements and is not a hiring-success prediction.</p>
          <GapRecommendations recommendations={result.gapRecommendations} error={result.gapError} />
        </>
      ) : null}
      <button type="button" className="mt-4 text-xs font-medium text-accent-deep hover:underline" onClick={() => void load()}>
        Recalculate
      </button>
    </CardShell>
  );
}

function SkillMatchHeading({
  percentage,
  skillMatch,
  showCount,
}: {
  percentage: number | null;
  skillMatch: SkillMatchSummary;
  showCount: boolean;
}) {
  if (percentage !== null) {
    const noun = skillMatch.comparedCount === 1 ? "skill" : "skills";
    const verb = skillMatch.comparedCount === 1 ? "is" : "are";
    return (
      <>
        <p className="text-3xl font-semibold text-navy">{percentage}%</p>
        <Progress className="mt-3" value={percentage} />
        {showCount ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {skillMatch.matchedCount} of {skillMatch.comparedCount} {noun} on this posting {verb} in your profile.
          </p>
        ) : null}
      </>
    );
  }
  if (skillMatch.emptyReason === "no_skill_requirements") {
    return <p className="text-sm text-muted-foreground">This posting has no skill requirements to compare.</p>;
  }
  return <p className="text-sm text-muted-foreground">Complete your profile to calculate this skill match.</p>;
}

function explanationSentences(explanation: string) {
  const sentences: string[] = [];
  let start = 0;
  for (let index = 0; index < explanation.length; index += 1) {
    const mark = explanation[index];
    if (mark !== "." && mark !== "?" && mark !== "!") continue;
    const next = explanation[index + 1];
    if (next !== undefined && !/\s/.test(next)) continue;
    sentences.push(explanation.slice(start, index + 1));
    let cursor = index + 1;
    while (cursor < explanation.length && /\s/.test(explanation[cursor])) cursor += 1;
    start = cursor;
    index = cursor - 1;
  }
  if (start < explanation.length) sentences.push(explanation.slice(start));
  return sentences;
}

function MatchExplanation({ explanation }: { explanation: string }) {
  const sentences = explanationSentences(explanation);
  return (
    <div className="mt-3 rounded-lg bg-navy-50 px-3 py-2">
      <h4 className="text-sm font-semibold text-navy">Why this percentage</h4>
      {sentences.length > 0 ? (
        <ul className="mt-1 space-y-2 text-sm leading-6 text-navy">
          {sentences.map((sentence, index) => (
            <li key={index}>{sentence}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GapRecommendations({
  recommendations,
  error,
}: {
  recommendations?: SkillGapRecommendation[] | null;
  error?: string | null;
}) {
  const [openSkill, setOpenSkill] = useState<string | null>(null);
  const selected = recommendations?.find((item) => item.skill === openSkill) ?? null;
  if (!error && !recommendations) return null;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-navy">How to raise this match</h4>
      {error ? <p className="mt-1 text-sm text-red-700">{error}</p> : null}
      {!error && recommendations?.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">There is no skill gap to fill.</p>
      ) : null}
      {!error && recommendations && recommendations.length > 0 ? (
        <>
          <p className="mt-1 text-xs text-muted-foreground">Skills that can raise this match sooner are listed first.</p>
          <ul className="mt-2 space-y-2">
            {recommendations.map((item) => (
              <li
                key={item.skill}
                className="group relative rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 pr-24 text-sm transition-colors hover:border-amber-300 hover:bg-amber-200 focus-within:border-amber-300 focus-within:bg-amber-200 focus-within:ring-2 focus-within:ring-ring"
              >
                <span className="font-semibold text-navy">{item.skill}</span>
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground underline underline-offset-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`See more about ${item.skill}`}
                  onClick={() => setOpenSkill(item.skill)}
                >
                  See more
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <SkillLearningDialog item={selected} onOpenChange={(open) => { if (!open) setOpenSkill(null); }} />
    </div>
  );
}

function SkillLearningDialog({
  item,
  onOpenChange,
}: {
  item: SkillGapRecommendation | null;
  onOpenChange: (open: boolean) => void;
}) {
  const howTo = item?.howTo?.trim() ?? "";
  const links = withCommonLearningSites(item?.skill ?? "", item?.links);
  const hasDetails = Boolean(howTo || links.length);
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="!shadow-none ring-0 outline-none focus:outline-none focus-visible:outline-none sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item?.skill ?? "Skill"}</DialogTitle>
          <DialogDescription className="sr-only">How to learn {item?.skill ?? "this skill"}.</DialogDescription>
        </DialogHeader>
        {hasDetails ? (
          <div className="space-y-4 text-sm text-navy">
            {howTo ? <p className="leading-6">{howTo}</p> : <p className="leading-6">A practical explanation is unavailable for this skill.</p>}
            {links.length ? <SkillLinks links={links} /> : <p>No website links are available for this skill.</p>}
          </div>
        ) : (
          <p className="text-sm leading-6 text-navy">Learning details are unavailable for this skill.</p>
        )}
        <DialogFooter>
          <Button variant="default" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SkillLinks({ links }: { links: SkillGapLink[] }) {
  return (
    <div>
      <h5 className="font-semibold text-navy">Useful websites</h5>
      <ul className="mt-2 space-y-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-navy underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </a>
            <p className="break-all text-xs text-muted-foreground">{link.url}</p>
          </li>
        ))}
      </ul>
    </div>
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

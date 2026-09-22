"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { deadlineLabel, formatShortDate, isDeadlineSoon } from "@/lib/dates";
import { documentProgress } from "@/lib/store";
import { companyInitials, cn } from "@/lib/utils";
import type { Internship } from "@/lib/types";

export function InternshipCard({ internship }: { internship: Internship }) {
  const { completed, total } = documentProgress(internship.documents);
  const soon = isDeadlineSoon(internship.deadline, 7);
  const hasDeadline = Boolean(internship.deadline);

  return (
    <Link href={`/internships/${internship.id}`} className="block h-full">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-sm font-semibold text-accent-deep">
            {companyInitials(internship.company)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">{internship.company}</p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{internship.role}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={internship.status} />
          <PriorityBadge priority={internship.priority} />
        </div>
        {hasDeadline ? (
          <div className="mt-4 space-y-0.5">
            <p className={cn("text-sm font-medium", soon ? "text-orange-700" : "text-navy")}>
              {deadlineLabel(internship.deadline)}
            </p>
            <p className="text-xs text-muted-foreground">Deadline: {formatShortDate(internship.deadline)}</p>
          </div>
        ) : (
          <span className="mt-4 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Deadline not added
          </span>
        )}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Documents</span>
            <span>
              {completed} of {total} documents
            </span>
          </div>
          <Progress value={total ? (completed / total) * 100 : 0} />
        </div>
      </Card>
    </Link>
  );
}

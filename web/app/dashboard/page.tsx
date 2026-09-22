"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileEdit,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/internships/StatusBadge";
import { documentProgress, useInternships } from "@/lib/store";
import { daysUntil, deadlineLabel, isDeadlineSoon } from "@/lib/dates";
import type { Internship } from "@/lib/types";

type SummaryKey = "total" | "saved" | "preparing" | "applied" | "interview" | "accepted";

const summary: Array<{
  key: SummaryKey;
  label: string;
  icon: LucideIcon;
  cardClass: string;
  iconClass: string;
}> = [
  {
    key: "total",
    label: "Total Internships",
    icon: Briefcase,
    cardClass: "border-[#A8C4E0] bg-[#C9E0F7]",
    iconClass: "text-[#4A72A8]",
  },
  {
    key: "saved",
    label: "Saved",
    icon: Bookmark,
    cardClass: "border-[#B8A8E0] bg-[#D6C9F7]",
    iconClass: "text-[#6A58B0]",
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: FileEdit,
    cardClass: "border-[#E0C4B0] bg-[#F7E4D6]",
    iconClass: "text-[#B07A52]",
  },
  {
    key: "applied",
    label: "Applied",
    icon: Send,
    cardClass: "border-[#E0D48A] bg-[#FFF3B0]",
    iconClass: "text-[#A8942A]",
  },
  {
    key: "interview",
    label: "Interview",
    icon: MessageSquare,
    cardClass: "border-[#E0B0C0] bg-[#F7D6E0]",
    iconClass: "text-[#B05A78]",
  },
  {
    key: "accepted",
    label: "Accepted",
    icon: CheckCircle2,
    cardClass: "border-[#A8C8AA] bg-[#C9E4CA]",
    iconClass: "text-[#4A8A52]",
  },
];

function attentionReasons(item: Internship) {
  const reasons: string[] = [];
  const days = daysUntil(item.deadline);
  if (days !== null && days < 0) reasons.push("Deadline overdue");
  else if (days !== null && days <= 7) reasons.push("Deadline within 7 days");
  const { completed, total } = documentProgress(item.documents);
  if (total > 0 && completed < total) reasons.push("Missing documents");
  if (item.priority === "high") reasons.push("High priority");
  return reasons;
}

export default function DashboardPage() {
  const { internships, ready, loadError } = useInternships();

  const counts = {
    total: internships.length,
    saved: internships.filter((i) => i.status === "saved").length,
    preparing: internships.filter((i) => i.status === "preparing").length,
    applied: internships.filter((i) => i.status === "applied").length,
    interview: internships.filter((i) => i.status === "interview").length,
    accepted: internships.filter((i) => i.status === "accepted").length,
  };

  const upcoming = [...internships]
    .filter((item) => daysUntil(item.deadline) !== null)
    .sort((a, b) => (daysUntil(a.deadline) ?? 99) - (daysUntil(b.deadline) ?? 99))
    .slice(0, 4);

  const needsAttention = internships.filter((item) => attentionReasons(item).length > 0).slice(0, 4);

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      )}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
          Good morning, Nway!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Here is an overview of your internship pipeline.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className={`p-4 shadow-none ${item.cardClass}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-navy/55">{item.label}</p>
                <Icon className={`h-4 w-4 shrink-0 ${item.iconClass}`} aria-hidden />
              </div>
              <p className="mt-2 text-2xl font-semibold text-navy">{counts[item.key]}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent-deep" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <Empty text="No upcoming deadlines yet. Add an internship to start tracking." />
            ) : (
              upcoming.map((item) => (
                <Link
                  key={item.id}
                  href={`/internships/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 hover:border-indigo-200 hover:bg-navy-50/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{item.company}</p>
                    <p className="truncate text-sm text-muted-foreground">{item.role}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`text-xs font-medium ${isDeadlineSoon(item.deadline) ? "text-orange-700" : "text-navy"}`}
                    >
                      {deadlineLabel(item.deadline)}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAttention.length === 0 ? (
              <Empty text="Nothing needs attention. Deadlines and documents look healthy." />
            ) : (
              needsAttention.map((item) => (
                <Link
                  key={item.id}
                  href={`/internships/${item.id}`}
                  className="block rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-3 hover:border-orange-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy">{item.company}</p>
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-xs text-orange-800">{attentionReasons(item).join(" · ")}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

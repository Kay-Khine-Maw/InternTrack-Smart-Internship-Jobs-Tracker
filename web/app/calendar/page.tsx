"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/internships/StatusBadge";
import { useInternships } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Internship, InternshipStatus } from "@/lib/types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function internshipHref(id: string) {
  return `/internships/${id}?from=calendar`;
}

type EventKind = "deadline" | "followUp" | "interview";

type CalendarEvent = {
  key: string;
  internshipId: string;
  company: string;
  role: string;
  day: string;
  kind: EventKind;
  status: InternshipStatus;
};

const KIND_META: Record<EventKind, { label: string; chip: string; bar: string; dot: string; title: string }> = {
  deadline: {
    label: "Application deadline",
    title: "Deadline",
    chip: "bg-rose-100 text-rose-600",
    bar: "bg-rose-400",
    dot: "bg-rose-400",
  },
  followUp: {
    label: "Follow-up Date",
    title: "Follow-up",
    chip: "bg-amber-100 text-amber-700",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
  },
  interview: {
    label: "Interview",
    title: "Interview",
    chip: "bg-violet-100 text-violet-600",
    bar: "bg-violet-400",
    dot: "bg-violet-400",
  },
};

function dayKey(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function eventsFromInternships(internships: Internship[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const item of internships) {
    const pairs: Array<[EventKind, string | null | undefined]> = [
      ["deadline", item.deadline],
      ["followUp", item.followUpDate],
      ["interview", item.interviewDate],
    ];
    for (const [kind, raw] of pairs) {
      const day = dayKey(raw);
      if (!day) continue;
      events.push({
        key: `${item.id}-${kind}-${day}`,
        internshipId: item.id,
        company: item.company,
        role: item.role,
        day,
        kind,
        status: item.status,
      });
    }
  }
  return events.sort((a, b) => a.day.localeCompare(b.day) || a.company.localeCompare(b.company));
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number | null; key: string | null }> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, key: null });
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, key: null });
  return cells;
}

function formatShort(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CalendarPage() {
  const router = useRouter();
  const { internships, ready, loadError } = useInternships();
  const now = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState<string | null>(todayKey());
  const [popover, setPopover] = useState<{ day: string; x: number; y: number } | null>(null);

  const events = useMemo(() => eventsFromInternships(internships), [internships]);
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.day) ?? [];
      list.push(event);
      map.set(event.day, list);
    }
    return map;
  }, [events]);

  const cells = monthCells(cursor.year, cursor.month);
  const today = todayKey();
  const yearOptions = useMemo(() => {
    const start = Math.min(now.getFullYear() - 3, cursor.year);
    const end = Math.max(now.getFullYear() + 5, cursor.year);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [cursor.year, now]);

  const upcoming = events.filter((event) => event.day >= today);

  function openEvents(day: string, eventList: CalendarEvent[], clientX?: number, clientY?: number) {
    setSelectedDay(day);
    if (eventList.length === 0) {
      setPopover(null);
      return;
    }
    if (eventList.length === 1) {
      setPopover(null);
      router.push(internshipHref(eventList[0].internshipId));
      return;
    }
    setPopover({ day, x: clientX ?? 0, y: clientY ?? 0 });
  }

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      )}

      <div className="flex justify-end">
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm text-navy/80">
          {(Object.keys(KIND_META) as EventKind[]).map((kind) => (
            <div key={kind} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", KIND_META[kind].dot)} />
              {KIND_META[kind].label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <Select
                value={String(cursor.month)}
                onValueChange={(value) => setCursor((prev) => ({ ...prev, month: Number(value) }))}
              >
                <SelectTrigger
                  className="h-9 w-[148px] border-0 bg-transparent px-2 text-xl font-semibold shadow-none focus:ring-1"
                  aria-label="Select month"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((name, index) => (
                    <SelectItem key={name} value={String(index)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(cursor.year)}
                onValueChange={(value) => setCursor((prev) => ({ ...prev, year: Number(value) }))}
              >
                <SelectTrigger
                  className="h-9 w-[108px] border-0 bg-transparent px-2 text-xl font-semibold shadow-none focus:ring-1"
                  aria-label="Select year"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() =>
                  setCursor((prev) =>
                    prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
                  )
                }
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() =>
                  setCursor((prev) =>
                    prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
                  )
                }
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
            {WEEKDAYS.map((day) => (
              <div key={day} className="truncate py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const dayEvents = cell.key ? byDay.get(cell.key) ?? [] : [];
              const isToday = cell.key === today;
              const isSelected = cell.key === selectedDay;
              return (
                <div
                  key={`${cell.key ?? "empty"}-${index}`}
                  className={cn(
                    "min-h-[104px] rounded-xl p-2 text-left align-top",
                    isToday && "bg-sky-50/80",
                    cell.day && "cursor-pointer hover:bg-navy-50/50"
                  )}
                  onClick={(event) => {
                    if (!cell.key) return;
                    openEvents(cell.key, dayEvents, event.clientX, event.clientY);
                  }}
                >
                  {cell.day ? (
                    <>
                      <span
                        className={cn(
                          "mb-2 inline-flex h-7 w-7 items-center justify-center text-sm",
                          isToday
                            ? "rounded-full bg-violet-500 font-semibold text-white"
                            : isSelected
                              ? "rounded-full bg-accent-soft font-medium text-accent-deep"
                              : "text-navy/80"
                        )}
                      >
                        {cell.day}
                      </span>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((item) => (
                          <Link
                            key={item.key}
                            href={internshipHref(item.internshipId)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedDay(cell.key ?? null);
                              setPopover(null);
                            }}
                            className={cn(
                              "block truncate rounded-full px-2 py-0.5 text-[11px] font-medium",
                              KIND_META[item.kind].chip
                            )}
                          >
                            {item.company}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 text-base font-semibold text-navy">Upcoming Events</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines, follow-ups, or interviews.</p>
            ) : (
              <div className="space-y-1">
                {upcoming.map((event) => (
                  <Link
                    key={event.key}
                    href={internshipHref(event.internshipId)}
                    onClick={() => setSelectedDay(event.day)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-navy-50",
                      selectedDay === event.day && "bg-sky-50"
                    )}
                  >
                    <span className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", KIND_META[event.kind].bar)} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-navy">
                        {event.company} {KIND_META[event.kind].title}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatShort(event.day)}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {popover && (
        <div className="fixed inset-0 z-40" onClick={() => setPopover(null)}>
          <div
            className="absolute z-50 w-72 rounded-2xl border border-border bg-white p-3 shadow-card"
            style={{
              left: Math.min(popover.x, window.innerWidth - 300),
              top: Math.min(popover.y + 8, window.innerHeight - 220),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatShort(popover.day)}
            </p>
            <div className="space-y-2">
              {(byDay.get(popover.day) ?? []).map((event) => (
                <Link
                  key={event.key}
                  href={internshipHref(event.internshipId)}
                  className="block rounded-xl border border-border px-3 py-2 hover:border-indigo-200 hover:bg-navy-50"
                >
                  <p className="text-sm font-semibold text-navy">{event.company}</p>
                  <p className="text-xs text-muted-foreground">{event.role}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", KIND_META[event.kind].chip)}>
                      {KIND_META[event.kind].title}
                    </span>
                    <StatusBadge status={event.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

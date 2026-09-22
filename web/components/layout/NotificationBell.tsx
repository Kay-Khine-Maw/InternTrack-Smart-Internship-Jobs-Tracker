"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { daysUntil } from "@/lib/dates";
import { useInternships } from "@/lib/store";
import { cn } from "@/lib/utils";

type NoticeKind = "deadline" | "followUp";

type Notice = {
  key: string;
  internshipId: string;
  company: string;
  kind: NoticeKind;
  days: number;
};

const STORAGE_KEY = "interntrack-read-notifications";
const LEGACY_STORAGE_KEY = "interntrack-dismissed-notifications";

function noticeDate(value?: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function parseIdList(raw: string | null) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readStoredIds() {
  if (typeof window === "undefined") return new Set<string>();
  const current = parseIdList(localStorage.getItem(STORAGE_KEY));
  const legacy = parseIdList(localStorage.getItem(LEGACY_STORAGE_KEY));
  const ids = new Set([...current, ...legacy]);
  if (legacy.length && current.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  }
  return ids;
}

function writeReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const KIND_LABEL: Record<NoticeKind, string> = {
  deadline: "Application deadline",
  followUp: "Follow-up",
};

function daysLeftLabel(days: number) {
  if (days < 0) {
    const overdue = Math.abs(days);
    return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
  }
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

function inWindow(days: number | null) {
  return days !== null && days >= -7 && days <= 7;
}

export function NotificationBell() {
  const { internships } = useInternships();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadIds(readStoredIds());
  }, []);

  const notices = useMemo(() => {
    const items: Notice[] = [];
    for (const internship of internships) {
      const deadlineDate = noticeDate(internship.deadline);
      const deadlineDays = daysUntil(internship.deadline);
      if (deadlineDate && inWindow(deadlineDays) && deadlineDays !== null) {
        items.push({
          key: `${internship.id}:deadline:${deadlineDate}`,
          internshipId: internship.id,
          company: internship.company,
          kind: "deadline",
          days: deadlineDays,
        });
      }
      const followUpDate = noticeDate(internship.followUpDate);
      const followUpDays = daysUntil(internship.followUpDate);
      if (followUpDate && inWindow(followUpDays) && followUpDays !== null) {
        items.push({
          key: `${internship.id}:followUp:${followUpDate}`,
          internshipId: internship.id,
          company: internship.company,
          kind: "followUp",
          days: followUpDays,
        });
      }
    }
    return items.sort((a, b) => a.days - b.days || a.company.localeCompare(b.company));
  }, [internships]);

  const unreadCount = notices.filter((item) => !readIds.has(item.key)).length;

  function markRead(key: string) {
    setReadIds((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      writeReadIds(next);
      return next;
    });
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative text-navy"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-slate-100 p-3 shadow-card">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Notifications</p>
          {notices.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No upcoming deadlines or follow-ups.</p>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {notices.map((item) => {
                const read = readIds.has(item.key);
                return (
                  <Link
                    key={item.key}
                    href={`/internships/${item.internshipId}`}
                    onClick={() => markRead(item.key)}
                    className={cn(
                      "block rounded-xl px-3 py-2",
                      read
                        ? "bg-white text-navy/70 hover:bg-white"
                        : "bg-transparent hover:bg-white/50"
                    )}
                  >
                    <p className={cn("truncate text-sm font-medium", read ? "text-navy/70" : "text-navy")}>
                      {item.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{KIND_LABEL[item.kind]}</p>
                    <p
                      className={cn(
                        "text-xs font-medium",
                        item.days < 0 ? "text-rose-600" : read ? "text-navy/55" : "text-accent-deep"
                      )}
                    >
                      {daysLeftLabel(item.days)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

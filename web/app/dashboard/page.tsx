"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/internships/PriorityBadge";
import { useInternships } from "@/lib/store";
import { formatShortDate } from "@/lib/dates";
import { companyInitials, cn } from "@/lib/utils";
import { PRIORITIES, PRIORITY_LABELS, type Internship, type Priority } from "@/lib/types";

const avatarTones = [
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const locationTones = ["bg-indigo-500", "bg-orange-400", "bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-rose-400"];

const priorityTone: Record<Priority, string> = {
  high: "border-orange-200 bg-orange-50",
  medium: "border-indigo-100 bg-accent-soft",
  low: "border-slate-200 bg-slate-50",
};

function canContact(item: Internship) {
  return Boolean(item.hrEmail?.trim() || item.applicationUrl?.trim());
}

function locationName(item: Internship) {
  const value = item.location?.trim();
  if (!value) return "Location not set";
  if (/\bremote\b/i.test(value)) return "Remote";
  return value;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { internships, ready, loadError } = useInternships();
  const [displayName, setDisplayName] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
    let active = true;
    void fetch("/api/profile")
      .then(async (response) => {
        const body = (await response.json()) as { profile?: { displayName?: string } };
        if (active && response.ok) setDisplayName(body.profile?.displayName?.trim() ?? "");
      })
      .catch(() => {
        if (active) setDisplayName("");
      });
    return () => {
      active = false;
    };
  }, []);

  const recent = [...internships].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const byPriority = Object.fromEntries(PRIORITIES.map((priority) => [priority, internships.filter((item) => item.priority === priority)])) as Record<Priority, Internship[]>;
  const locationCounts = new Map<string, number>();
  for (const item of internships) {
    const name = locationName(item);
    locationCounts.set(name, (locationCounts.get(name) ?? 0) + 1);
  }
  const locations = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const readyToContact = internships.filter(canContact);
  const needsContact = internships.filter((item) => !canContact(item));
  const locationMax = locations[0]?.[1] ?? 1;

  if (!ready) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full max-w-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
          {greeting}
          {displayName ? `, ${displayName}` : ""}!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Your saved internships, grouped by what you can act on.</p>
      </div>

      {internships.length === 0 ? (
        <Card className="overflow-hidden border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-orange-400 px-6 py-8 text-white">
            <p className="text-lg font-semibold">No internships saved yet</p>
            <p className="mt-1 max-w-lg text-sm text-white/90">Add a job link and it will show up here by priority, location, and whether you can contact them.</p>
            <Link href="/add-internship" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700">
              Add an internship
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Saved" value={internships.length} hint="Internships in your tracker" className="border-indigo-200 bg-indigo-50 text-indigo-950" />
            <Stat label="High priority" value={byPriority.high.length} hint="Jobs you marked high" className="border-orange-200 bg-orange-50 text-orange-950" />
            <Stat label="Ready to contact" value={readyToContact.length} hint="Have an email or apply link" className="border-emerald-200 bg-emerald-50 text-emerald-950" />
            <Stat label="Locations" value={locations.length} hint="Cities and remote roles" className="border-sky-200 bg-sky-50 text-sky-950" />
          </div>

          <div className="grid gap-6 xl:grid-cols-5">
            <Card className="overflow-hidden border-indigo-100 xl:col-span-3">
              <CardHeader className="border-b border-indigo-100 bg-indigo-50/70">
                <CardTitle className="flex items-center gap-2 text-indigo-950">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Recently added
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {recent.map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/internships/${item.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-3 hover:border-indigo-200 hover:bg-indigo-50/40"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold", avatarTones[index % avatarTones.length])}>
                      {companyInitials(item.company)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{item.company}</p>
                      <p className="truncate text-sm text-muted-foreground">{item.role}</p>
                      <p className="truncate text-xs text-navy/60">{locationName(item)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <PriorityBadge priority={item.priority} />
                      <span className="text-xs text-muted-foreground">{formatShortDate(item.createdAt)}</span>
                    </div>
                  </Link>
                ))}
                {internships.length > recent.length && (
                  <Link href="/internships" className="inline-flex pt-1 text-sm font-medium text-accent-deep hover:underline">
                    See all {internships.length} internships
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-orange-100 xl:col-span-2">
              <CardHeader className="border-b border-orange-100 bg-orange-50/80">
                <CardTitle className="text-orange-950">By priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {PRIORITIES.map((priority) => {
                  const items = byPriority[priority];
                  return (
                    <div key={priority} className={cn("rounded-xl border p-3", priorityTone[priority])}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-navy">{PRIORITY_LABELS[priority]}</p>
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-navy">{items.length}</span>
                      </div>
                      {items.length === 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">None in this group yet.</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {items.slice(0, 3).map((item) => (
                            <li key={item.id}>
                              <Link href={`/internships/${item.id}`} className="block truncate text-sm text-navy hover:underline">
                                {item.company}
                                <span className="text-muted-foreground"> · {item.role}</span>
                              </Link>
                            </li>
                          ))}
                          {items.length > 3 && <li className="text-xs text-muted-foreground">+{items.length - 3} more</li>}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden border-sky-100">
              <CardHeader className="border-b border-sky-100 bg-sky-50/80">
                <CardTitle className="flex items-center gap-2 text-sky-950">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  By location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {locations.map(([name, count], index) => (
                  <div key={name}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <p className="truncate font-medium text-navy">{name}</p>
                      <p className="shrink-0 text-muted-foreground">{count}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sky-100">
                      <div
                        className={cn("h-full rounded-full", locationTones[index % locationTones.length])}
                        style={{ width: `${Math.max(14, Math.round((count / locationMax) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-emerald-100">
              <CardHeader className="border-b border-emerald-100 bg-emerald-50/80">
                <CardTitle className="flex items-center gap-2 text-emerald-950">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  Ready to contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
                <ContactList title="Can apply" items={readyToContact} tone="text-emerald-800" empty="None have an email or apply link yet." />
                <ContactList title="Needs a contact" items={needsContact} tone="text-amber-800" empty="Every saved job has a way to apply." />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint, className }: { label: string; value: number; hint: string; className: string }) {
  return (
    <div className={cn("rounded-2xl border px-4 py-4", className)}>
      <p className="text-3xl font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs opacity-75">{hint}</p>
    </div>
  );
}

function ContactList({ title, items, tone, empty }: { title: string; items: Internship[]; tone: string; empty: string }) {
  return (
    <div>
      <p className={cn("text-xs font-semibold uppercase tracking-wide", tone)}>
        {title} · {items.length}
      </p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link href={`/internships/${item.id}`} className="block rounded-lg bg-white px-2 py-1.5 hover:bg-emerald-50/60">
                <p className="truncate text-sm font-medium text-navy">{item.company}</p>
                <p className="truncate text-xs text-muted-foreground">{item.hrEmail?.trim() || item.applicationUrl?.trim() || item.role}</p>
              </Link>
            </li>
          ))}
          {items.length > 4 && <li className="text-xs text-muted-foreground">+{items.length - 4} more</li>}
        </ul>
      )}
    </div>
  );
}

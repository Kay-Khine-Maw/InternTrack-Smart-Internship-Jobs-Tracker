"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InternshipCard } from "@/components/internships/InternshipCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternships } from "@/lib/store";
import { INTERNSHIP_STATUSES, STATUS_LABELS, type InternshipStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: Array<"all" | InternshipStatus> = ["all", ...INTERNSHIP_STATUSES];

export default function InternshipsPage() {
  const { internships, ready, loadError } = useInternships();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | InternshipStatus>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return internships.filter((item) => {
      const statusOk = status === "all" || item.status === status;
      if (!statusOk) return false;
      if (!q) return true;
      const haystack = [item.company, item.role, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [internships, query, status]);

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, position, or tags"
            aria-label="Search internships"
          />
        </div>
        <Button asChild>
          <Link href="/add-internship">
            <Plus className="h-4 w-4" />
            Add Internship
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              status === item
                ? "border-accent-deep bg-accent-soft text-accent-deep"
                : "border-border bg-white text-navy hover:bg-navy-50"
            )}
          >
            {item === "all" ? "All" : STATUS_LABELS[item]}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {visible.length} of {internships.length} internships
      </p>

      {!ready ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-navy">No internships match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another search term, choose All, or add a new internship.
          </p>
          <Button asChild className="mt-4">
            <Link href="/add-internship">Add Internship</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <InternshipCard key={item.id} internship={item} />
          ))}
        </div>
      )}
    </div>
  );
}

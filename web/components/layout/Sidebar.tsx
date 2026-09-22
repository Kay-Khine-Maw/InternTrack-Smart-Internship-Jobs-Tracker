"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CalendarDays, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/internships", label: "Internships", icon: Briefcase },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-navy/40 lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white px-4 py-6 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-deep text-sm font-bold text-white">
              IT
            </span>
            <span className="text-lg font-semibold tracking-tight text-navy">InternTrack</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-navy-50 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent-deep"
                    : "text-navy/70 hover:bg-navy-50 hover:text-navy"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-xs leading-5 text-muted-foreground">
          Track internships, deadlines, and documents in one place.
        </p>
      </aside>
    </>
  );
}

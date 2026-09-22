"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { InternshipProvider } from "@/lib/store";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

const meta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your internship pipeline",
  },
  "/internships": {
    title: "My Internships",
    subtitle: "Search, filter, and open any saved opportunity",
  },
  "/add-internship": {
    title: "Add Internship",
    subtitle: "Paste a job link or upload a posting, then review before saving",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Your student profile for internship applications",
  },
  "/calendar": {
    title: "Calendar",
    subtitle: "Deadlines, follow-ups, and interviews in one view.",
  },
};

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const page = useMemo(() => {
    if (pathname.startsWith("/internships/") && pathname !== "/internships") {
      return { title: "Internship workspace", subtitle: "Deadlines, documents, status, and notes in one place" };
    }
    return meta[pathname] ?? { title: "InternTrack", subtitle: "Internship tracker for university students" };
  }, [pathname]);

  return (
    <InternshipProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={page.title} subtitle={page.subtitle} onMenu={() => setOpen(true)} />
          <main className="page-enter flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </InternshipProvider>
  );
}

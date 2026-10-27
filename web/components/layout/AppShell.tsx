"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const [authUser, setAuthUser] = useState<{ id: string } | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/auth") {
      setAuthUser(null);
      setAuthResolved(true);
      return;
    }
    let active = true;
    setAuthResolved(false);
    void fetch("/api/auth/me")
      .then(async (response) => {
        const body = (await response.json().catch(() => null)) as { user?: { id?: string } } | null;
        if (!active) return;
        if (!response.ok || !body?.user?.id) {
          setAuthUser(null);
          router.replace("/auth");
          return;
        }
        setAuthUser({ id: body.user.id });
      })
      .catch(() => {
        if (active) {
          setAuthUser(null);
          router.replace("/auth");
        }
      })
      .finally(() => {
        if (active) setAuthResolved(true);
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  const page = useMemo(() => {
    if (pathname.startsWith("/internships/") && pathname !== "/internships") {
      return { title: "Internship workspace", subtitle: "Deadlines, documents, priority, and notes in one place" };
    }
    return meta[pathname] ?? { title: "InternTrack", subtitle: "Internship tracker for university students" };
  }, [pathname]);

  if (pathname === "/auth") return <>{children}</>;
  if (!authResolved || !authUser) return null;

  return (
    <InternshipProvider key={authUser.id}>
      <div className="flex min-h-screen bg-background">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <Navbar title={page.title} subtitle={page.subtitle} onMenu={() => setOpen(true)} />
          <main className="page-enter flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </InternshipProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profileInitial } from "@/lib/profile";
import { NotificationBell } from "./NotificationBell";

export function Navbar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
}) {
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/me")
      .then(async (response) => {
        const body = (await response.json()) as { user?: { name?: string; email?: string } };
        if (active && response.ok) {
          setProfileName(body.user?.name?.trim() ?? "");
        }
      })
      .catch(() => {
        if (active) setProfileName("");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu} aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-navy sm:text-xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <NotificationBell />
          <Link
            href="/profile"
            aria-label="Open profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-semibold text-white shadow-sm ring-2 ring-white hover:from-indigo-500 hover:to-violet-600"
          >
            {profileName ? profileInitial(profileName) : "..."}
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(search.get("mode") === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password }),
    });
    const body = await response.json().catch(() => null) as { message?: string };
    if (!response.ok) {
      setError(body?.message ?? "Authentication failed.");
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="grid min-h-[620px] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-navy/5 md:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-gradient-to-br from-navy via-[#24366b] to-accent-deep p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold ring-1 ring-white/20">IT</span>
              <span className="text-xl font-semibold">InternTrack</span>
            </div>
            <h2 className="mt-16 max-w-sm text-4xl font-semibold leading-tight">Turn internship opportunities into your next step.</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Capture opportunities, review extracted details, and keep every application organized in one workspace.</p>
          </div>
          <div className="space-y-3 text-sm text-white/80">
            {["Keep your profile ready", "Track deadlines and documents", "Review every detail before saving"].map((item) => (
              <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-200" />{item}</p>
            ))}
          </div>
        </section>
        <form onSubmit={submit} className="flex flex-col justify-center space-y-5 p-7 sm:p-10">
          <div className="flex items-center gap-2 text-accent-deep md:hidden"><BriefcaseBusiness className="h-5 w-5" /><span className="font-semibold">InternTrack</span></div>
          <div>
            <p className="text-sm font-medium text-accent-deep">{mode === "signin" ? "Welcome back" : "Get started"}</p>
            <h1 className="mt-1 text-2xl font-semibold text-navy">{mode === "signin" ? "Sign in to your workspace" : "Create your account"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{mode === "signin" ? "Continue managing your internship applications." : "Start organizing your internship journey today."}</p>
          </div>
          <div className="space-y-4">
            {mode === "signup" ? <label className="block text-sm font-medium text-navy">Full name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" aria-label="Full name" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-accent-deep focus:ring-2 focus:ring-accent-deep/15" /></label> : null}
            <label className="block text-sm font-medium text-navy">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-accent-deep focus:ring-2 focus:ring-accent-deep/15" /></label>
            <label className="block text-sm font-medium text-navy">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" aria-label="Password" className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-accent-deep focus:ring-2 focus:ring-accent-deep/15" /></label>
          </div>
          {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p> : null}
          <button disabled={busy} className="w-full rounded-xl bg-accent-deep px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-deep/90 disabled:opacity-60">{busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}</button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to InternTrack?" : "Already have an account?"}{" "}
            <button type="button" className="font-medium text-accent-deep underline underline-offset-2" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Mail, MapPin, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyProfile, profileInitial, type StudentProfile } from "@/lib/profile";
import type { ResumeDraft } from "@/lib/resume-schema";

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(createEmptyProfile());
  const [draft, setDraft] = useState<StudentProfile>(createEmptyProfile());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeDraft, setResumeDraft] = useState<ResumeDraft | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/profile");
        const body = (await response.json().catch(() => null)) as { profile?: StudentProfile; message?: string } | null;
        if (!response.ok || !body?.profile) {
          throw new Error(body?.message || "Could not load profile.");
        }
        if (!cancelled) {
          setProfile(body.profile);
          setDraft(body.profile);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateDraft<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function cancelEdits() {
    setDraft(profile);
    setEditing(false);
    setError(null);
  }

  async function uploadResume(file: File) {
    setResumeLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/profile/resume", { method: "POST", body: form });
      const body = (await response.json().catch(() => null)) as { draft?: ResumeDraft; message?: string } | null;
      if (!response.ok || !body?.draft) throw new Error(body?.message || "Could not process this resume.");
      setResumeDraft(body.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process this resume.");
    } finally {
      setResumeLoading(false);
    }
  }

  function applyResumeDraft() {
    if (!resumeDraft) return;
    const extractedMajor = resumeDraft.education
      .map((item) => item.major?.trim())
      .find((value): value is string => Boolean(value));
    const extractedSchool = resumeDraft.education
      .map((item) => item.school.trim())
      .find(Boolean);
    setDraft((current) => ({
      ...current,
      displayName: resumeDraft.displayName || current.displayName,
      email: resumeDraft.contact.email || current.email,
      location: resumeDraft.address || current.location,
      major: resumeDraft.major || extractedMajor || current.major,
      year: resumeDraft.year || "",
      university: extractedSchool || current.university,
      bio: resumeDraft.summary || current.bio,
      skills: resumeDraft.skills.length ? resumeDraft.skills : current.skills,
      tools: resumeDraft.tools.length ? resumeDraft.tools : current.tools,
      resumeSummary: resumeDraft.summary || current.resumeSummary,
      resumeContact: {
        ...current.resumeContact,
        ...(resumeDraft.contact.email ? { email: resumeDraft.contact.email } : {}),
        ...(resumeDraft.contact.phone ? { phone: resumeDraft.contact.phone } : {}),
      },
      resumeEducation: resumeDraft.education,
      resumeExperience: resumeDraft.experience,
      resumeProjects: resumeDraft.projects,
      resumeLanguages: resumeDraft.languages,
      resumeLinks: resumeDraft.links,
    }));
    setResumeDraft(null);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = (await response.json().catch(() => null)) as { profile?: StudentProfile; message?: string } | null;
      if (!response.ok || !body?.profile) {
        throw new Error(body?.message || "Could not save profile.");
      }
      setProfile(body.profile);
      setDraft(body.profile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const view = editing ? draft : profile;
  const initial = profileInitial(view.displayName);

  return (
    <div className="mx-auto max-w-3xl">
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      <div className="overflow-visible rounded-3xl border border-border bg-white shadow-card">
        <div className="relative z-0 h-28 overflow-visible rounded-t-3xl bg-gradient-to-r from-indigo-400 via-blue-500 to-violet-500 sm:h-32">
          {!editing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute right-4 top-4 z-10 rounded-full border-white/40 bg-white/95 text-navy shadow-sm hover:bg-white"
              onClick={() => {
                setDraft(profile);
                setEditing(true);
              }}
              disabled={loading || saving}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          ) : null}
        </div>

        <div className="relative z-20 px-6 pb-8 sm:px-8">
          <div className="relative z-20 -mt-8 mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-semibold text-white shadow-md ring-4 ring-white">
            {initial}
          </div>

          {editing ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" value={draft.displayName} onChange={(value) => updateDraft("displayName", value)} />
                <Field label="Major" value={draft.major} onChange={(value) => updateDraft("major", value)} />
                <Field label="Year" value={draft.year} onChange={(value) => updateDraft("year", value)} />
                <Field label="University" value={draft.university} onChange={(value) => updateDraft("university", value)} />
                <Field label="Email" value={draft.email} onChange={(value) => updateDraft("email", value)} />
                <Field label="Address" value={draft.location} onChange={(value) => updateDraft("location", value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea
                  id="profile-bio"
                  value={draft.bio}
                  onChange={(event) => updateDraft("bio", event.target.value)}
                  placeholder="Tell companies about yourself"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Internship Start Date"
                      type="date"
                      value={draft.internshipPeriod.start}
                      onChange={(value) => updateDraft("internshipPeriod", { ...draft.internshipPeriod, start: value })}
                    />
                    <Field
                      label="Internship End Date"
                      type="date"
                      value={draft.internshipPeriod.end}
                      onChange={(value) => updateDraft("internshipPeriod", { ...draft.internshipPeriod, end: value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relocation-willingness">Relocation willingness</Label>
                  <select
                    id="relocation-willingness"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.relocationWillingness === null ? "" : String(draft.relocationWillingness)}
                    onChange={(event) => updateDraft("relocationWillingness", event.target.value === "" ? null : event.target.value === "true")}
                  >
                    <option value="">Not specified</option>
                    <option value="true">Willing</option>
                    <option value="false">Not willing</option>
                  </select>
                </div>
              </div>
              <ChipEditor
                label="Preferred Internship Fields"
                items={draft.preferredFields}
                onChange={(items) => updateDraft("preferredFields", items)}
              />
              <Field
                label="Preferred Location"
                value={draft.preferredLocation}
                onChange={(value) => updateDraft("preferredLocation", value)}
              />
              <ChipEditor label="Skills" items={draft.skills} onChange={(items) => updateDraft("skills", items)} />
              <ChipEditor label="Tools" items={draft.tools} onChange={(items) => updateDraft("tools", items)} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={cancelEdits} disabled={saving}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void save()} disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-accent-soft/50 p-4">
                <div>
                  <p className="font-medium text-navy">Complete your profile from a resume</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX content is processed by Gemini and shown for review before saving.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center rounded-md bg-accent-deep px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                  {resumeLoading ? "Processing..." : "Upload Resume"}
                  <input
                    className="sr-only"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={resumeLoading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadResume(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              {resumeDraft ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-amber-950">Review extracted resume information</p>
                  <p className="mt-1 text-sm text-amber-900">Existing values are preserved until you choose to use extracted values. You can correct them before saving.</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-950">
                    {resumeDraft.displayName ? <li>Name: {resumeDraft.displayName}</li> : null}
                    {resumeDraft.year ? <li>Year: {resumeDraft.year}</li> : null}
                    {resumeDraft.address ? <li>Address: {resumeDraft.address}</li> : null}
                    {resumeDraft.skills.length ? <li>Skills: {resumeDraft.skills.join(", ")}</li> : null}
                    {resumeDraft.tools.length ? <li>Tools: {resumeDraft.tools.join(", ")}</li> : null}
                    {resumeDraft.education.length ? (
                      <li>
                        Education: {resumeDraft.education[0]?.school}
                        {resumeDraft.education[0]?.major ? ` — ${resumeDraft.education[0].major}` : ""}
                      </li>
                    ) : null}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Button type="button" onClick={applyResumeDraft}>Use extracted values</Button>
                    <Button type="button" variant="outline" onClick={() => setResumeDraft(null)}>Cancel</Button>
                  </div>
                </div>
              ) : null}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-navy">{view.displayName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {view.major} · {view.year}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-navy/75">{view.bio}</p>
              </div>

              <div className="space-y-2.5 text-sm text-navy/80">
                <InfoRow icon={GraduationCap} text={view.university} />
                <InfoRow icon={Mail} text={view.email} />
                <InfoRow icon={MapPin} text={view.location || "Address not set"} />
              </div>

              <div className="border-t border-border/80 pt-5">
                <p className="mb-3 text-sm font-medium text-navy">Preferred Internship Fields</p>
                <ChipList items={view.preferredFields} />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-navy">Preferred Location</p>
                <InfoRow icon={MapPin} text={view.preferredLocation || "Not specified"} />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-navy">Skills</p>
                <ChipList items={view.skills} />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-navy">Tools</p>
                <ChipList items={view.tools} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-navy/45" />
      <span>{text}</span>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None added yet.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ChipEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [next, setNext] = useState("");

  function add() {
    const value = next.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setNext("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
          >
            {item}
            <button
              type="button"
              className="rounded-full p-0.5 text-sky-600 hover:bg-sky-100"
              onClick={() => onChange(items.filter((entry) => entry !== item))}
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={next}
          onChange={(event) => setNext(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={`Add ${label.toLowerCase()}`}
        />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

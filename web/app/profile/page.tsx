"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Mail, MapPin, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_PROFILE, profileInitial, type StudentProfile } from "@/lib/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                <Field label="Location" value={draft.location} onChange={(value) => updateDraft("location", value)} />
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
                <InfoRow icon={MapPin} text={view.location} />
              </div>

              <div className="border-t border-border/80 pt-5">
                <p className="mb-3 text-sm font-medium text-navy">Preferred Internship Fields</p>
                <ChipList items={view.preferredFields} />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-navy">Preferred Location</p>
                <InfoRow icon={MapPin} text={view.preferredLocation} />
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
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

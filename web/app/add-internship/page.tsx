"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Link2, Loader2 } from "lucide-react";
import { FieldTranslateBar } from "@/components/internships/FieldTranslateBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { DuplicateWarningModal } from "@/components/modals/DuplicateWarningModal";
import { useInternships } from "@/lib/store";
import { createId } from "@/lib/utils";
import { hasAnyExtractedField, toReviewDraft } from "@/lib/extract-mapper";
import { toDuplicateInfo, type DuplicateInfo } from "@/lib/duplicate-match";
import type { ExtractedInternshipData, InternshipTranslations, Priority, ReviewDraft, TranslatableField } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/types";

type Step = "input" | "review";
type Phase = "idle" | "uploading" | "extracting" | "analyzing" | "saving";

const OPTIONAL_HINT = "Information not found. Add it manually.";

const phaseCopy: Record<Exclude<Phase, "idle">, string> = {
  uploading: "Uploading...",
  extracting: "Extracting text...",
  analyzing: "Analyzing internship information...",
  saving: "Saving...",
};

export default function AddInternshipPage() {
  const router = useRouter();
  const { addInternship, findDuplicate } = useInternships();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState("link");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [newDoc, setNewDoc] = useState("");
  const [newReq, setNewReq] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const [dupOpen, setDupOpen] = useState(false);
  const [pendingExtract, setPendingExtract] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [translations, setTranslations] = useState<InternshipTranslations>({});
  const [langView, setLangView] = useState<Partial<Record<TranslatableField, "original" | "translated">>>({});
  const [translateBusy, setTranslateBusy] = useState<TranslatableField | null>(null);
  const [translateError, setTranslateError] = useState<Partial<Record<TranslatableField, string>>>({});

  const missing = useMemo(() => {
    if (!draft) {
      return {
        companyName: false,
        position: false,
        deadline: false,
        location: false,
        description: false,
        requirements: false,
        documents: false,
        applicationUrl: false,
        hrEmail: false,
        skills: false,
      };
    }
    return {
      companyName: !draft.companyName.trim(),
      position: !draft.position.trim(),
      deadline: !draft.deadline.trim(),
      location: !draft.location.trim(),
      description: !draft.description.trim(),
      requirements: draft.requirements.length === 0,
      documents: draft.documents.length === 0,
      applicationUrl: !draft.applicationUrl.trim(),
      hrEmail: !draft.hrEmail.trim(),
      skills: draft.skills.length === 0,
    };
  }, [draft]);

  const requiredMissing = Boolean(missing.companyName || missing.position);
  const canSave = Boolean(draft && !requiredMissing);
  const busy = phase !== "idle";

  function updateDraft(patch: Partial<ReviewDraft>) {
    setDirty(true);
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function fieldText(field: TranslatableField) {
    if (!draft) return "";
    if (field === "companyName") return draft.companyName;
    if (field === "requirements") return draft.requirements.join("\n");
    if (field === "documents") return draft.documents.map((doc) => doc.name).join("\n");
    if (field === "skills") return draft.skills.join("\n");
    if (field === "position") return draft.position;
    if (field === "location") return draft.location;
    if (field === "description") return draft.description;
    return draft.notes;
  }

  function shownText(field: TranslatableField) {
    const original = fieldText(field);
    const view = langView[field] ?? "original";
    const entry = translations[field];
    if (view === "translated" && entry?.translatedText) return entry.translatedText;
    return original;
  }

  function applyShownText(field: TranslatableField, next: string) {
    const view = langView[field] ?? "original";
    if (view === "translated" && translations[field]) {
      setTranslations((prev) => ({
        ...prev,
        [field]: { originalText: prev[field]?.originalText || fieldText(field), translatedText: next },
      }));
      setDirty(true);
      return;
    }
    if (field === "companyName") updateDraft({ companyName: next });
    else if (field === "position") updateDraft({ position: next });
    else if (field === "location") updateDraft({ location: next });
    else if (field === "description") updateDraft({ description: next });
    else if (field === "notes") updateDraft({ notes: next });
    else if (field === "requirements") {
      updateDraft({ requirements: next.split(/\n/).map((item) => item.trim()).filter(Boolean) });
    } else if (field === "skills") {
      updateDraft({ skills: next.split(/\n/).map((item) => item.trim()).filter(Boolean) });
    }
  }

  async function selectEnglish(field: TranslatableField) {
    const original = fieldText(field).trim();
    if (!original) return;
    const entry = translations[field];
    if (entry?.translatedText && entry.originalText === original) {
      setLangView((prev) => ({ ...prev, [field]: "translated" }));
      return;
    }
    setTranslateBusy(field);
    setTranslateError((prev) => ({ ...prev, [field]: undefined }));
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: original, target: "en", field }),
      });
      const body = (await response.json().catch(() => null)) as { translatedText?: string; message?: string } | null;
      if (!response.ok || !body?.translatedText) {
        throw new Error(body?.message || "Could not translate this field.");
      }
      setTranslations((prev) => ({
        ...prev,
        [field]: { originalText: original, translatedText: body.translatedText! },
      }));
      setLangView((prev) => ({ ...prev, [field]: "translated" }));
    } catch (err) {
      setTranslateError((prev) => ({
        ...prev,
        [field]: err instanceof Error ? err.message : "Could not translate this field.",
      }));
    } finally {
      setTranslateBusy(null);
    }
  }

  function translateBar(field: TranslatableField) {
    return (
      <FieldTranslateBar
        hasValue={Boolean(fieldText(field).trim())}
        view={langView[field] ?? "original"}
        busy={translateBusy === field}
        error={translateError[field]}
        hasTranslation={Boolean(translations[field]?.translatedText)}
        onTranslate={() => void selectEnglish(field)}
        onSelectOriginal={() => setLangView((prev) => ({ ...prev, [field]: "original" }))}
        onSelectEnglish={() => void selectEnglish(field)}
      />
    );
  }

  function resetDuplicateState() {
    setDuplicate(null);
    setDupOpen(false);
    setPendingExtract(false);
  }

  async function runExtract() {
    setError(null);
    setDuplicate(null);
    setDupOpen(false);
    const usingFile = tab === "upload" && Boolean(file);
    setPhase(usingFile ? "uploading" : "extracting");
    const extractTimer = usingFile ? window.setTimeout(() => setPhase("extracting"), 200) : 0;
    const analyzingTimer = window.setTimeout(() => setPhase("analyzing"), usingFile ? 1600 : 400);

    try {
      const response = usingFile
        ? await fetch("/api/extract", { method: "POST", body: buildForm() })
        : await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
      const body = (await response.json().catch(() => null)) as {
        message?: string;
        data?: ExtractedInternshipData;
        extractedText?: string;
        source?: { sourceUrl?: string | null; filename?: string | null };
        extractionHistoryId?: string;
        duplicate?: DuplicateInfo | { existingId?: string; id?: string; company?: string; companyName?: string; role?: string; position?: string; sourceUrl?: string | null } | null;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message || "Extraction failed. Please try again.");
      }

      const extractedText = body?.extractedText?.trim() ?? "";
      const normalized = body?.data;
      if (!normalized && !extractedText) {
        throw new Error(
          usingFile
            ? "Could not read this image. Try a clearer photo or a PDF."
            : "Extraction failed. Please try again."
        );
      }

      const draftFromApi = toReviewDraft(normalized ?? {}, {
        sourceUrl: body?.source?.sourceUrl ?? (usingFile ? "" : url),
        extractionHistoryId: body?.extractionHistoryId,
        extractedText,
      });

      if (!hasAnyExtractedField(normalized ?? {
        companyName: null,
        position: null,
        location: null,
        deadline: null,
        description: null,
        requirements: [],
        requiredDocuments: [],
        applicationUrl: null,
        hrEmail: null,
        skills: [],
      }) && !extractedText) {
        throw new Error(
          usingFile
            ? "Could not read this image. Try a clearer photo or a PDF."
            : "No internship fields could be extracted. Try another posting."
        );
      }

      setDraft(draftFromApi);
      setTranslations({});
      setLangView({});
      setTranslateError({});
      setDirty(false);
      setStep("review");

      if (body?.duplicate) {
        const raw = body.duplicate;
        const info = toDuplicateInfo({
          id: raw.id || raw.existingId || "",
          companyName: raw.companyName || raw.company,
          position: raw.position || raw.role,
          sourceUrl: raw.sourceUrl,
        });
        if (info.id) {
          setDuplicate(info);
          setDupOpen(true);
        }
      } else {
        setDuplicate(null);
        setDupOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed. Please try again.");
      setStep("input");
    } finally {
      window.clearTimeout(extractTimer);
      window.clearTimeout(analyzingTimer);
      setPhase("idle");
    }
  }

  function buildForm() {
    const form = new FormData();
    if (file) form.set("file", file);
    if (tab === "link" && url) form.set("url", url);
    return form;
  }

  function requestExtract() {
    setError(null);
    resetDuplicateState();
    if (tab === "link" && !url.trim()) {
      setError("Please enter a valid http or https job URL.");
      return;
    }
    if (tab === "upload" && !file) {
      setError("Choose a PDF, DOCX, PNG, or JPG to extract.");
      return;
    }
    if (tab === "upload" && file && !/\.(pdf|docx|png|jpe?g)$/i.test(file.name)) {
      setError("Unsupported file type. Please upload a PDF, DOCX, PNG, or JPG.");
      return;
    }
    if (tab === "upload" && file && file.size > 10 * 1024 * 1024) {
      setError("That file is larger than 10MB. Please upload a smaller PDF, DOCX, PNG, or JPG.");
      return;
    }
    if (tab === "link") {
      const existing = findDuplicate({ sourceUrl: url }, { urlOnly: true });
      if (existing) {
        setDuplicate(existing);
        setPendingExtract(true);
        setDupOpen(true);
        return;
      }
    }
    void runExtract();
  }

  async function commitSave(addAnyway = false) {
    if (!draft || !canSave) return;
    setPhase("saving");
    setError(null);
    try {
      const created = await addInternship({
        companyName: draft.companyName.trim(),
        position: draft.position.trim(),
        location: draft.location,
        deadline: draft.deadline.trim() || null,
        description: draft.description,
        requirements: draft.requirements,
        skills: draft.skills,
        requiredDocuments: draft.documents.map((doc) => ({ name: doc.name, completed: doc.completed })),
        tags: draft.skills.slice(0, 4),
        applicationUrl: draft.applicationUrl || (tab === "link" ? url : "") || null,
        hrEmail: draft.hrEmail.trim() || null,
        sourceUrl: draft.sourceUrl || (tab === "link" ? url : "") || null,
        notes: draft.notes,
        priority,
        extractionHistoryId: draft.extractionHistoryId,
        translations,
        addAnyway,
      });
      router.push(`/internships/${created.id}`);
    } catch (err) {
      const duplicateError = err as Error & { duplicate?: DuplicateInfo };
      if (duplicateError.duplicate?.id) {
        setDuplicate(duplicateError.duplicate);
        setPendingExtract(false);
        setDupOpen(true);
      } else {
        setError(duplicateError.message || "Could not save the internship.");
      }
    } finally {
      setPhase("idle");
    }
  }

  function save() {
    if (!draft || !canSave) return;
    const existing = findDuplicate({
      sourceUrl: draft.sourceUrl || url,
      applicationUrl: draft.applicationUrl,
      companyName: draft.companyName,
      position: draft.position,
    });
    if (existing) {
      setDuplicate(existing);
      setPendingExtract(false);
      setDupOpen(true);
      return;
    }
    void commitSave(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {step === "input" && phase === "idle" && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="link" className="flex-1">
              Paste Job Link
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              Upload Job Post
            </TabsTrigger>
          </TabsList>
          <TabsContent value="link">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-accent-deep" />
                  Paste Job Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-url">Job URL</Label>
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="https://careers.google.com/..."
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </div>
                <Button onClick={requestExtract} disabled={busy}>
                  Extract Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-accent-deep" />
                  Upload Job Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const dropped = event.dataTransfer.files?.[0];
                    if (dropped) setFile(dropped);
                  }}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-accent-soft/40 px-6 py-10 text-center hover:bg-accent-soft"
                >
                  <FileUp className="mb-2 h-6 w-6 text-accent-deep" />
                  <p className="text-sm font-medium text-navy">Drag and drop, or click to choose a file</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, PNG, or JPG — real text extraction, then Gemini</p>
                  {file && <p className="mt-3 text-sm text-accent-deep">{file.name}</p>}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  className="sr-only"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <Button onClick={requestExtract} disabled={busy}>
                  Extract Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {phase !== "idle" && (
        <Card className="px-6 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent-deep" />
          <p className="mt-4 text-base font-medium text-navy">{phaseCopy[phase]}</p>
          {phase === "analyzing" && (
            <p className="mt-1 text-sm text-muted-foreground">Analyzing internship post...</p>
          )}
        </Card>
      )}

      {step === "review" && draft && phase === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Review information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Verify AI output before saving. Empty fields need your review.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredMissing && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                Some required fields are empty. Company and position must be completed before save.
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Company"
                required
                value={draft.companyName}
                onChange={(value) => updateDraft({ companyName: value })}
              />
              <Field
                label="Position"
                required
                value={shownText("position")}
                onChange={(value) => applyShownText("position", value)}
                toolbar={translateBar("position")}
              />
              <Field
                label="Location"
                value={shownText("location")}
                onChange={(value) => applyShownText("location", value)}
                toolbar={translateBar("location")}
              />
              <Field
                label="Deadline"
                value={draft.deadline}
                type="date"
                hint={!draft.deadline.trim() ? "Deadline not found. Add it manually." : undefined}
                onChange={(value) => updateDraft({ deadline: value })}
              />
              <Field
                label="Application URL"
                value={draft.applicationUrl}
                placeholder="Application link not found. Add it manually."
                onChange={(value) => updateDraft({ applicationUrl: value })}
              />
              <Field
                label="HR email"
                value={draft.hrEmail}
                placeholder="HR email not found. Add it manually."
                onChange={(value) => updateDraft({ hrEmail: value })}
              />
            </div>
            <Field
              label="Description"
              value={shownText("description")}
              multiline
              onChange={(value) => applyShownText("description", value)}
              toolbar={translateBar("description")}
            />
            <ListEditor
              label="Requirements"
              toolbar={translateBar("requirements")}
              items={
                langView.requirements === "translated" && translations.requirements?.translatedText
                  ? translations.requirements.translatedText.split(/\n/).map((item) => item.trim()).filter(Boolean)
                  : draft.requirements
              }
              value={newReq}
              onValue={setNewReq}
              onAdd={() => {
                if (!newReq.trim()) return;
                updateDraft({ requirements: [...draft.requirements, newReq.trim()] });
                setNewReq("");
              }}
              onRemove={(index) =>
                updateDraft({ requirements: draft.requirements.filter((_, i) => i !== index) })
              }
            />
            <div className="space-y-2">
              <div className="flex h-7 items-center justify-between gap-2">
                <Label>Required Documents</Label>
                {translateBar("documents")}
              </div>
              <div className="space-y-2 rounded-xl border border-border p-3">
                {draft.documents.length === 0 && (
                  <p className="text-sm text-muted-foreground">{OPTIONAL_HINT}</p>
                )}
                {(langView.documents === "translated" && translations.documents?.translatedText
                  ? translations.documents.translatedText.split(/\n/).map((name, index) => ({
                      id: draft.documents[index]?.id ?? `tr-doc-${index}`,
                      name,
                      completed: draft.documents[index]?.completed ?? false,
                    }))
                  : draft.documents
                ).map((doc) => (
                  <label key={doc.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={doc.completed}
                      onCheckedChange={() =>
                        updateDraft({
                          documents: draft.documents.map((item) =>
                            item.id === doc.id ? { ...item, completed: !item.completed } : item
                          ),
                        })
                      }
                    />
                    <span className="flex-1">{doc.name}</span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-red-600"
                      onClick={() =>
                        updateDraft({ documents: draft.documents.filter((item) => item.id !== doc.id) })
                      }
                    >
                      Remove
                    </button>
                  </label>
                ))}
                <div className="flex gap-2 pt-1">
                  <Input value={newDoc} onChange={(event) => setNewDoc(event.target.value)} placeholder="Add a document" />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (!newDoc.trim()) return;
                      updateDraft({
                        documents: [...draft.documents, { id: createId("doc"), name: newDoc.trim(), completed: false }],
                      });
                      setNewDoc("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            <ListEditor
              label="Skills"
              toolbar={translateBar("skills")}
              items={
                langView.skills === "translated" && translations.skills?.translatedText
                  ? translations.skills.translatedText.split(/\n/).map((item) => item.trim()).filter(Boolean)
                  : draft.skills
              }
              value={newSkill}
              onValue={setNewSkill}
              onAdd={() => {
                if (!newSkill.trim()) return;
                updateDraft({ skills: [...draft.skills, newSkill.trim()] });
                setNewSkill("");
              }}
              onRemove={(index) => updateDraft({ skills: draft.skills.filter((_, i) => i !== index) })}
            />
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {PRIORITY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field
              label="Notes"
              value={shownText("notes")}
              multiline
              placeholder="Add notes..."
              onChange={(value) => applyShownText("notes", value)}
              toolbar={translateBar("notes")}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => (dirty ? setDiscardOpen(true) : resetInput())}>
                Cancel
              </Button>
              <Button onClick={save} disabled={!canSave || busy}>
                Save Internship
              </Button>
            </div>
            {!canSave && (
              <p className="text-right text-xs text-red-700">
                Company and position are required to save.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <DuplicateWarningModal
        open={dupOpen}
        existing={duplicate}
        onOpenChange={setDupOpen}
        onAddAnyway={() => {
          if (pendingExtract) {
            setPendingExtract(false);
            void runExtract();
          } else {
            void commitSave(true);
          }
        }}
      />
      <ConfirmModal
        open={discardOpen}
        title="Discard this review?"
        description="Unsaved changes will be lost and you will return to the job input step."
        confirmLabel="Discard"
        destructive
        onOpenChange={setDiscardOpen}
        onConfirm={resetInput}
      />
    </div>
  );

  function resetInput() {
    setStep("input");
    setDraft(null);
    setDirty(false);
    setError(null);
    resetDuplicateState();
    setTranslations({});
    setLangView({});
    setTranslateError({});
  }
}

function Field({
  label,
  value,
  onChange,
  required,
  toolbar,
  placeholder = OPTIONAL_HINT,
  hint,
  type,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  toolbar?: ReactNode;
  placeholder?: string;
  hint?: string;
  type?: string;
  multiline?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <div className="flex h-7 items-center justify-between gap-2">
        <Label htmlFor={id} className="shrink-0">
          {label}
          {required ? " *" : ""}
        </Label>
        {toolbar}
      </div>
      {multiline ? (
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={type === "date" ? undefined : placeholder}
        />
      )}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ListEditor({
  label,
  items,
  value,
  onValue,
  onAdd,
  onRemove,
  toolbar,
}: {
  label: string;
  items: string[];
  value: string;
  onValue: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  toolbar?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-7 items-center justify-between gap-2">
        <Label className="shrink-0">{label}</Label>
        {toolbar}
      </div>
      <div className="space-y-2 rounded-xl border border-border p-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{OPTIONAL_HINT}</p>}
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center justify-between gap-2 text-sm">
            <span>{item}</span>
            <button type="button" className="text-xs text-muted-foreground hover:text-red-600" onClick={() => onRemove(index)}>
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input value={value} onChange={(event) => onValue(event.target.value)} placeholder={`Add ${label.toLowerCase()}`} />
          <Button type="button" variant="secondary" onClick={onAdd}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

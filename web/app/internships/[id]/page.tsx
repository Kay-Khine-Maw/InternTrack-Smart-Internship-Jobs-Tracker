"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentChecklist } from "@/components/internships/DocumentChecklist";
import { EditInternshipModal } from "@/components/internships/EditInternshipModal";
import { PriorityBadge } from "@/components/internships/PriorityBadge";
import { ProgressTimeline } from "@/components/internships/ProgressTimeline";
import { StatusBadge } from "@/components/internships/StatusBadge";
import { TranslatableReadout } from "@/components/internships/FieldTranslateBar";
import { UpdateStatusModal } from "@/components/internships/UpdateStatusModal";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { daysUntil, deadlineRemainingLabel, formatLongDate, formatShortDate, isDeadlineSoon } from "@/lib/dates";
import { useInternships } from "@/lib/store";
import { companyInitials, cn } from "@/lib/utils";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function InternshipBackLink() {
  const searchParams = useSearchParams();
  const fromCalendar = searchParams.get("from") === "calendar";
  return (
    <Link
      href={fromCalendar ? "/calendar" : "/internships"}
      className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      {fromCalendar ? "Back to Calendar" : "Back to My Internships"}
    </Link>
  );
}

export default function InternshipDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, toggleDocument, addDocument, removeDocument, deleteInternship, setPriority, updateInternship } =
    useInternships();
  const internship = getById(params.id);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const days = internship ? daysUntil(internship.deadline) : null;
  const overdue = (days ?? 0) < 0;
  const soon = internship ? isDeadlineSoon(internship.deadline) : false;

  const info = useMemo(() => {
    if (!internship) return [];
    return [
      ["Deadline", internship.deadline ? formatLongDate(internship.deadline) : "Deadline not found. Add it manually."],
      ["Application link", internship.url || "—"],
      ["Date added", formatShortDate(internship.createdAt)],
      ["Tags", internship.tags.length ? internship.tags.join(", ") : "—"],
    ] as Array<[string, string]>;
  }, [internship]);

  function persistTranslation(field: import("@/lib/translations").TranslatableField, originalText: string, translatedText: string) {
    if (!internship) return;
    void updateInternship(internship.id, {
      translations: {
        ...(internship.translations ?? {}),
        [field]: { originalText, translatedText },
      },
    });
  }

  if (!internship) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-navy">Internship not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been deleted from this browser.</p>
        <div className="mt-4">
          <Suspense
            fallback={
              <Link
                href="/internships"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Internships
              </Link>
            }
          >
            <InternshipBackLink />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <Link
            href="/internships"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-deep hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Internships
          </Link>
        }
      >
        <InternshipBackLink />
      </Suspense>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-lg font-semibold text-accent-deep">
              {companyInitials(internship.company)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-navy sm:text-2xl">{internship.company}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">{internship.role}</p>
              <p className="mt-1 text-sm text-navy/70">{internship.location || "Location not set"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={internship.priority} onClick={() => setPriorityOpen(true)} />
                <StatusBadge status={internship.status} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit Internship
            </Button>
            <Button onClick={() => setStatusOpen(true)}>Update Status</Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              Delete Internship
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent-deep" />
              Application Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {internship.deadline ? (
              <>
                <p
                  className={cn(
                    "text-2xl font-semibold",
                    overdue || soon ? "text-orange-700" : "text-navy"
                  )}
                >
                  {formatLongDate(internship.deadline)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{deadlineRemainingLabel(internship.deadline)}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Deadline not found. Add it manually.</p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTimeline status={internship.status} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentChecklist
              documents={internship.documents}
              onToggle={(id) => toggleDocument(internship.id, id)}
              onAdd={(name) => addDocument(internship.id, name)}
              onRemove={(id) => removeDocument(internship.id, id)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1 border-b border-border/70 pb-3 sm:grid-cols-[140px_1fr]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">HR email</p>
              <p className={internship.hrEmail ? "text-sm text-navy" : "text-sm text-muted-foreground"}>
                {internship.hrEmail || "HR email not found. Add it manually."}
              </p>
            </div>
            <div className="grid gap-1 border-b border-border/70 pb-3 sm:grid-cols-[140px_1fr]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</p>
              <p className="text-sm text-navy">{internship.company}</p>
            </div>
            {(
              [
                ["Position", "position", internship.role],
                ["Location", "location", internship.location || ""],
                ["Description", "description", internship.description || ""],
                ["Requirements", "requirements", (internship.requirements ?? []).join("\n")],
                ["Notes", "notes", internship.notes || ""],
              ] as const
            ).map(([label, field, original]) => (
              <div key={field} className="border-b border-border/70 pb-3">
                <TranslatableReadout
                  label={label}
                  field={field}
                  original={original}
                  translations={internship.translations}
                  onTranslated={persistTranslation}
                />
              </div>
            ))}
            {info.map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-border/70 pb-3 last:border-0 sm:grid-cols-[140px_1fr]">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                {label === "Application link" && internship.url ? (
                  <a
                    href={internship.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 break-all text-sm text-accent-deep hover:underline"
                  >
                    {internship.url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-navy">{value}</p>
                )}
              </div>
            ))}
            {internship.status === "applied" && internship.applicationDate && (
              <p className="text-sm text-muted-foreground">
                Applied {formatLongDate(internship.applicationDate)}
                {internship.followUpDate ? ` · Follow-up ${formatLongDate(internship.followUpDate)}` : ""}
              </p>
            )}
            {internship.status === "interview" && (
              <div className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-navy">
                <p>
                  Interview {internship.interviewDate ? formatLongDate(internship.interviewDate) : "date TBD"}
                  {internship.interviewTime ? ` at ${internship.interviewTime}` : ""}
                </p>
                {internship.interviewLink && (
                  <a className="text-accent-deep hover:underline" href={internship.interviewLink} target="_blank" rel="noreferrer">
                    {internship.interviewLink}
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditInternshipModal open={editOpen} internship={internship} onOpenChange={setEditOpen} />
      <UpdateStatusModal open={statusOpen} internship={internship} onOpenChange={setStatusOpen} />
      <ConfirmModal
        open={deleteOpen}
        title="Delete this internship?"
        description="This removes it from your local tracker. You can add it again later."
        confirmLabel="Delete Internship"
        destructive
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          deleteInternship(internship.id);
          router.push("/internships");
        }}
      />
      <Dialog open={priorityOpen} onOpenChange={setPriorityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change priority</DialogTitle>
            <DialogDescription>
              High-priority internships appear more urgently on the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={internship.priority}
              onValueChange={(value) => setPriority(internship.id, value as Priority)}
            >
              <SelectTrigger id="priority">
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
          <DialogFooter>
            <Button onClick={() => setPriorityOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

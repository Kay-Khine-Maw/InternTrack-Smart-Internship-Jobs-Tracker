"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDays, toDateInput } from "@/lib/dates";
import { useInternships } from "@/lib/store";
import type { Internship } from "@/lib/types";

interface Props {
  open: boolean;
  internship: Internship;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailsModal({ open, internship, onOpenChange }: Props) {
  const { updateInternship } = useInternships();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationDate, setApplicationDate] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [preparationNotes, setPreparationNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setApplicationDate(toDateInput(internship.applicationDate));
    setInterviewDate(toDateInput(internship.interviewDate));
    setInterviewTime(internship.interviewTime ?? "");
    setInterviewLink(internship.interviewLink ?? "");
    setPreparationNotes(internship.preparationNotes ?? "");
  }, [open, internship]);

  const followUpDate = useMemo(
    () => (applicationDate ? addDays(applicationDate, 7) : ""),
    [applicationDate]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Application Details</DialogTitle>
          <DialogDescription>Keep dates and interview preparation details current for {internship.company}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border border-indigo-100 bg-accent-soft/60 p-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDate">Application Date</Label>
              <Input id="applicationDate" type="date" value={applicationDate} onChange={(event) => setApplicationDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up date</Label>
              <Input id="followUpDate" type="date" value={followUpDate} readOnly />
              <p className="text-xs text-muted-foreground">Automatically set to 7 days after the application date.</p>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-indigo-100 bg-accent-soft/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Interview Date</Label>
                <Input id="interviewDate" type="date" value={interviewDate} onChange={(event) => setInterviewDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">Interview Time</Label>
                <Input id="interviewTime" type="time" value={interviewTime} onChange={(event) => setInterviewTime(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewLink">Interview Link</Label>
              <Input id="interviewLink" value={interviewLink} onChange={(event) => setInterviewLink(event.target.value)} placeholder="https://meet.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparationNotes">Preparation Notes</Label>
              <Textarea id="preparationNotes" value={preparationNotes} onChange={(event) => setPreparationNotes(event.target.value)} placeholder="Questions to practice, projects to mention..." />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                await updateInternship(internship.id, {
                  applicationDate: applicationDate || undefined,
                  followUpDate: followUpDate || undefined,
                  interviewDate: interviewDate || undefined,
                  interviewTime: interviewTime || undefined,
                  interviewLink: interviewLink || undefined,
                  preparationNotes: preparationNotes || undefined,
                });
                onOpenChange(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not update application details.");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save Details"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERNSHIP_STATUSES, STATUS_LABELS, type Internship, type InternshipStatus } from "@/lib/types";
import { addDays, toDateInput } from "@/lib/dates";
import { useInternships } from "@/lib/store";

interface Props {
  open: boolean;
  internship: Internship;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStatusModal({ open, internship, onOpenChange }: Props) {
  const { setStatus } = useInternships();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setLocalStatus] = useState<InternshipStatus>(internship.status);
  const [applicationDate, setApplicationDate] = useState(toDateInput(internship.applicationDate) || toDateInput(new Date().toISOString()));
  const [interviewDate, setInterviewDate] = useState(toDateInput(internship.interviewDate));
  const [interviewTime, setInterviewTime] = useState(internship.interviewTime ?? "");
  const [interviewLink, setInterviewLink] = useState(internship.interviewLink ?? "");
  const [preparationNotes, setPreparationNotes] = useState(internship.preparationNotes ?? "");

  useEffect(() => {
    if (!open) return;
    setLocalStatus(internship.status);
    setApplicationDate(toDateInput(internship.applicationDate) || toDateInput(new Date().toISOString()));
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
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Move {internship.company} through your internship pipeline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setLocalStatus(value as InternshipStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERNSHIP_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "applied" && (
            <div className="space-y-3 rounded-xl border border-indigo-100 bg-accent-soft/60 p-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Application Date</Label>
                <Input
                  id="applicationDate"
                  type="date"
                  value={applicationDate}
                  onChange={(event) => setApplicationDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up date</Label>
                <Input id="followUpDate" type="date" value={followUpDate} readOnly />
                <p className="text-xs text-muted-foreground">Automatically set to 7 days after the application date.</p>
              </div>
            </div>
          )}

          {status === "interview" && (
            <div className="space-y-3 rounded-xl border border-indigo-100 bg-accent-soft/60 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interviewDate">Interview Date</Label>
                  <Input
                    id="interviewDate"
                    type="date"
                    value={interviewDate}
                    onChange={(event) => setInterviewDate(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewTime">Interview Time</Label>
                  <Input
                    id="interviewTime"
                    type="time"
                    value={interviewTime}
                    onChange={(event) => setInterviewTime(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewLink">Interview Link</Label>
                <Input
                  id="interviewLink"
                  value={interviewLink}
                  onChange={(event) => setInterviewLink(event.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationNotes">Preparation Notes</Label>
                <Textarea
                  id="preparationNotes"
                  value={preparationNotes}
                  onChange={(event) => setPreparationNotes(event.target.value)}
                  placeholder="Questions to practice, projects to mention..."
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                await setStatus(internship.id, status, {
                  applicationDate: status === "applied" ? applicationDate : internship.applicationDate,
                  followUpDate: status === "applied" ? followUpDate : internship.followUpDate,
                  interviewDate: status === "interview" ? interviewDate : internship.interviewDate,
                  interviewTime: status === "interview" ? interviewTime : internship.interviewTime,
                  interviewLink: status === "interview" ? interviewLink : internship.interviewLink,
                  preparationNotes: status === "interview" ? preparationNotes : internship.preparationNotes,
                });
                onOpenChange(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not update status.");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

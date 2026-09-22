"use client";

import { useEffect, useState } from "react";
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
import { PRIORITIES, PRIORITY_LABELS, type Internship, type Priority } from "@/lib/types";
import { toDateInput } from "@/lib/dates";
import { useInternships } from "@/lib/store";

interface Props {
  open: boolean;
  internship: Internship;
  onOpenChange: (open: boolean) => void;
}

export function EditInternshipModal({ open, internship, onOpenChange }: Props) {
  const { updateInternship } = useInternships();
  const [company, setCompany] = useState(internship.company);
  const [role, setRole] = useState(internship.role);
  const [location, setLocation] = useState(internship.location ?? "");
  const [deadline, setDeadline] = useState(toDateInput(internship.deadline));
  const [url, setUrl] = useState(internship.url ?? "");
  const [notes, setNotes] = useState(internship.notes ?? "");
  const [tags, setTags] = useState(internship.tags.join(", "));
  const [priority, setPriority] = useState<Priority>(internship.priority);

  useEffect(() => {
    if (!open) return;
    setCompany(internship.company);
    setRole(internship.role);
    setLocation(internship.location ?? "");
    setDeadline(toDateInput(internship.deadline));
    setUrl(internship.url ?? "");
    setNotes(internship.notes ?? "");
    setTags(internship.tags.join(", "));
    setPriority(internship.priority);
  }, [open, internship]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Internship</DialogTitle>
          <DialogDescription>Update the details saved for this opportunity.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Company" value={company} onChange={setCompany} />
          <Field label="Position" value={role} onChange={setRole} />
          <Field label="Location" value={location} onChange={setLocation} />
          <div className="space-y-2">
            <Label htmlFor="edit-deadline">Deadline</Label>
            <Input id="edit-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            {!deadline.trim() ? (
              <p className="text-sm text-muted-foreground">Deadline not found. Add it manually.</p>
            ) : null}
          </div>
          <Field label="Application link" value={url} onChange={setUrl} />
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
          <Field label="Tags" value={tags} onChange={setTags} />
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await updateInternship(internship.id, {
                  company,
                  role,
                  location,
                  deadline: deadline || null,
                  url,
                  notes,
                  priority,
                  tags: tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                });
                onOpenChange(false);
              } catch (err) {
                window.alert(err instanceof Error ? err.message : "Could not save changes.");
              }
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

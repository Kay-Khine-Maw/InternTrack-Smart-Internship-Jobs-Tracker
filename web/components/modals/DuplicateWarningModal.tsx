"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DuplicateInfo } from "@/lib/duplicate-match";

interface Props {
  open: boolean;
  existing?: DuplicateInfo | null;
  onAddAnyway: () => void;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateWarningModal({ open, existing, onAddAnyway, onOpenChange }: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This internship may already be saved</DialogTitle>
          <DialogDescription>This internship already exists in your tracker.</DialogDescription>
        </DialogHeader>
        {existing ? (
          <div className="rounded-xl border border-border bg-navy-50/60 px-4 py-3 text-sm">
            <p className="text-navy">
              <span className="font-medium">Company:</span> {existing.companyName || "—"}
            </p>
            <p className="mt-1 text-navy">
              <span className="font-medium">Position:</span> {existing.position || "—"}
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={!existing}
            onClick={() => {
              if (existing) router.push(`/internships/${existing.id}`);
            }}
          >
            View Existing
          </Button>
          <Button
            onClick={() => {
              onAddAnyway();
              onOpenChange(false);
            }}
          >
            Add Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

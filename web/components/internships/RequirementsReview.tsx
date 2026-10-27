"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternships } from "@/lib/store";
import type { Internship } from "@/lib/types";
import type { MatchingRequirement } from "@/lib/matching";

export function RequirementsReview({ internship }: { internship: Internship }) {
  const { updateInternship } = useInternships();
  const [items, setItems] = useState<MatchingRequirement[]>(internship.matchingRequirements ?? []);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateInternship(internship.id, { matchingRequirements: items });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="font-semibold text-navy">Review internship requirements</h3>
      <p className="mt-1 text-xs text-muted-foreground">Only reviewed criteria are used for matching. Do not mark a technology as required unless the posting clearly says so.</p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
            <span className="text-navy">{item.label} <span className="text-xs text-muted-foreground">({item.classification})</span></span>
            <button type="button" className="text-xs text-red-700 hover:underline" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Reviewed skill or tool" aria-label="Reviewed requirement" />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const trimmed = label.trim();
            if (!trimmed) return;
            setItems((current) => [...current, { label: trimmed, category: "skill", classification: "required" }]);
            setLabel("");
          }}
        >
          Add
        </Button>
      </div>
      <Button className="mt-3" type="button" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving..." : "Save reviewed requirements"}
      </Button>
    </div>
  );
}

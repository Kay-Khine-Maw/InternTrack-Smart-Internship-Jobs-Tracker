"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documentProgress } from "@/lib/store";
import type { DocumentItem } from "@/lib/types";

interface Props {
  documents: DocumentItem[];
  onToggle: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function DocumentChecklist({ documents, onToggle, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");
  const { completed, total } = documentProgress(documents);

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-navy">
        {completed} of {total} documents completed
      </p>
      <ul className="space-y-2">
        {documents.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No documents yet. Add resume, transcript, or a cover letter to get started.
          </li>
        ) : (
          documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-navy-50/50 px-3 py-2.5"
            >
              <Checkbox
                id={doc.id}
                checked={doc.completed}
                onCheckedChange={() => onToggle(doc.id)}
                aria-label={`Mark ${doc.name} complete`}
              />
              <label htmlFor={doc.id} className="flex-1 cursor-pointer text-sm text-navy">
                {doc.name}
              </label>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-white hover:text-red-600"
                aria-label={`Delete ${doc.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const next = name.trim();
          if (!next) return;
          onAdd(next);
          setName("");
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add document name"
          aria-label="New document name"
        />
        <Button type="submit" variant="secondary">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>
    </div>
  );
}

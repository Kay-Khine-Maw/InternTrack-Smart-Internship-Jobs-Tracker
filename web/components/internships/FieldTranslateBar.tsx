"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InternshipTranslations, TranslatableField } from "@/lib/translations";

export const TRANSLATE_ICON_SRC = "/google-translate.png";

function TranslateIcon({ spinning }: { spinning?: boolean }) {
  if (spinning) return <Loader2 className="h-4 w-4 animate-spin text-accent-deep" />;
  return (
    <img
      src={TRANSLATE_ICON_SRC}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 object-contain"
    />
  );
}

function ModeLink({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-xs disabled:opacity-60",
        active ? "font-semibold text-accent-deep" : "text-muted-foreground hover:text-navy"
      )}
    >
      {children}
    </button>
  );
}

export function FieldTranslateBar({
  hasValue,
  view,
  busy,
  error,
  hasTranslation,
  onTranslate,
  onSelectOriginal,
  onSelectEnglish,
}: {
  hasValue: boolean;
  view: "original" | "translated";
  busy?: boolean;
  error?: string | null;
  hasTranslation?: boolean;
  onTranslate: () => void;
  onSelectOriginal: () => void;
  onSelectEnglish: () => void;
}) {
  if (!hasValue) return null;
  const showSwitch = Boolean(hasTranslation);

  return (
    <div className="flex min-w-0 flex-col items-end gap-1">
      <div className="flex h-7 shrink-0 items-center justify-end gap-2">
        {!showSwitch ? (
          <button
            type="button"
            onClick={onTranslate}
            disabled={busy}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent-soft disabled:opacity-70"
            aria-label="Translate"
          >
            <TranslateIcon spinning={busy} />
          </button>
        ) : (
          <>
            <ModeLink active={view === "original"} onClick={onSelectOriginal}>
              Original
            </ModeLink>
            <span className="text-xs text-border">|</span>
            <ModeLink active={view === "translated"} disabled={busy} onClick={onSelectEnglish}>
              English
            </ModeLink>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-deep" /> : null}
          </>
        )}
      </div>
      {error ? <p className="max-w-[16rem] text-right text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

export function TranslatableReadout({
  field,
  original,
  translations,
  onTranslated,
  label,
}: {
  field: TranslatableField;
  original: string;
  translations?: InternshipTranslations;
  onTranslated: (field: TranslatableField, originalText: string, translatedText: string) => void;
  label?: string;
}) {
  const [view, setView] = useState<"original" | "translated">("original");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entry = translations?.[field];
  const text = view === "translated" && entry?.translatedText ? entry.translatedText : original || "—";

  async function selectEnglish() {
    if (!original.trim()) return;
    if (entry?.translatedText && entry.originalText === original.trim()) {
      setView("translated");
      return;
    }
    setBusy(true);
    setError(null);
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
      onTranslated(field, original.trim(), body.translatedText);
      setView("translated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not translate this field.");
    } finally {
      setBusy(false);
    }
  }

  const bar = (
    <FieldTranslateBar
      hasValue={Boolean(original.trim())}
      view={view}
      busy={busy}
      error={error}
      hasTranslation={Boolean(entry?.translatedText)}
      onTranslate={() => void selectEnglish()}
      onSelectOriginal={() => setView("original")}
      onSelectEnglish={() => void selectEnglish()}
    />
  );

  return (
    <div className="space-y-1">
      {label ? (
        <div className="flex h-7 items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {bar}
        </div>
      ) : (
        bar
      )}
      <p className="text-sm text-navy whitespace-pre-wrap">{text}</p>
    </div>
  );
}

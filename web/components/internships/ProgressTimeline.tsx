import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, TIMELINE_STATUSES, type InternshipStatus } from "@/lib/types";

export function ProgressTimeline({ status }: { status: InternshipStatus }) {
  const currentIndex = TIMELINE_STATUSES.indexOf(status as (typeof TIMELINE_STATUSES)[number]);
  const rejected = status === "rejected";

  return (
    <ol className="space-y-0">
      {TIMELINE_STATUSES.map((step, index) => {
        const complete = !rejected && currentIndex >= 0 && index < currentIndex;
        const current = !rejected && step === status;
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                  complete && "border-accent-deep bg-accent-deep text-white",
                  current && "border-accent-deep bg-accent-soft text-accent-deep ring-4 ring-indigo-50",
                  !complete && !current && "border-border bg-white text-muted-foreground"
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {index < TIMELINE_STATUSES.length - 1 && (
                <span className={cn("my-1 w-px flex-1 min-h-[20px]", complete ? "bg-accent-deep" : "bg-border")} />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className={cn("text-sm font-medium", current ? "text-accent-deep" : "text-navy")}>
                {STATUS_LABELS[step]}
              </p>
              {current && <p className="text-xs text-muted-foreground">Current stage</p>}
            </div>
          </li>
        );
      })}
      {rejected && (
        <li className="flex gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
            ✕
          </span>
          <div className="pt-1">
            <p className="text-sm font-medium text-rose-700">Rejected</p>
            <p className="text-xs text-muted-foreground">Current stage</p>
          </div>
        </li>
      )}
    </ol>
  );
}

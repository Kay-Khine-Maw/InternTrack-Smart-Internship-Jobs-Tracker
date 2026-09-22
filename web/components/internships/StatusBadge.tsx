import { cn } from "@/lib/utils";
import { STATUS_LABELS, type InternshipStatus } from "@/lib/types";

const styles: Record<InternshipStatus, string> = {
  saved: "bg-slate-100 text-slate-700 border-slate-200",
  preparing: "bg-indigo-50 text-indigo-700 border-indigo-100",
  applied: "bg-blue-50 text-blue-700 border-blue-100",
  interview: "bg-violet-50 text-violet-700 border-violet-100",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

export function StatusBadge({ status, className }: { status: InternshipStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

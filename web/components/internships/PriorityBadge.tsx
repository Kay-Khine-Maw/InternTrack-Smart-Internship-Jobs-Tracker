import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-accent-soft text-accent-deep border-indigo-100",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

export function PriorityBadge({
  priority,
  className,
  onClick,
}: {
  priority: Priority;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[priority],
        onClick && "cursor-pointer hover:opacity-90",
        className
      )}
    >
      {PRIORITY_LABELS[priority]} priority
    </Comp>
  );
}

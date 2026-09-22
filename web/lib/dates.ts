export function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInput(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number) {
  const date = parseDate(isoDate);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysUntil(deadline?: string | null, now = new Date()) {
  const date = parseDate(deadline);
  if (!date) return null;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function formatLongDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "Not set";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function deadlineLabel(deadline?: string | null) {
  const days = daysUntil(deadline);
  if (days === null) return "Deadline not added";
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export function deadlineRemainingLabel(deadline?: string | null) {
  const days = daysUntil(deadline);
  if (days === null) return null;
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function isDeadlineSoon(deadline?: string | null, windowDays = 7) {
  const days = daysUntil(deadline);
  return days !== null && days <= windowDays;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

const TRACKING_PARAM = /^(utm_|fbclid|gclid|mc_|_ga)/i;

export function normalizeUrl(url?: string | null) {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    const kept = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (TRACKING_PARAM.test(key) || key.toLowerCase() === "ref") return;
      kept.append(key, value);
    });
    const search = kept.toString();
    return `${parsed.protocol}//${host}${path}${search ? `?${search}` : ""}`;
  } catch {
    return trimmed.replace(/\/+$/, "").toLowerCase();
  }
}

export function companyInitials(company: string) {
  const words = company.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

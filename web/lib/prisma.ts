import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function appendQueryParams(url: string, params: Record<string, string>) {
  const entries = Object.entries(params).filter(([key]) => {
    const pattern = new RegExp(`[?&]${key}=`);
    return !pattern.test(url);
  });
  if (entries.length === 0) return url;
  const query = entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

function resolveDatabaseUrl() {
  const pooled = process.env.DATABASE_URL_POOLED?.trim();
  const direct = process.env.DATABASE_URL?.trim();
  // On Vercel serverless, prefer the pooled URL when present.
  let url = process.env.VERCEL && pooled ? pooled : direct || pooled;
  if (!url) return undefined;

  // Each serverless isolate should hold at most one DB connection.
  if (process.env.VERCEL) {
    const params: Record<string, string> = {
      connection_limit: "1",
      pool_timeout: "20",
    };
    if (/pooled\./i.test(url) || /pooler/i.test(url)) {
      params.pgbouncer = "true";
    }
    url = appendQueryParams(url, params);
  }

  return url;
}

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
  });

// Reuse one client across warm serverless invocations.
globalForPrisma.prisma = prisma;

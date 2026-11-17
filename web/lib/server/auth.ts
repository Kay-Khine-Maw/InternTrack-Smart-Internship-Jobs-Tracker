import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AppError } from "./errors";

export const SESSION_COOKIE = "interntrack_session";
const SESSION_DAYS = 30;

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createSession(userId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.authSession.create({ data: { id, userId, expiresAt } });
  cookies().set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (id) await prisma.authSession.deleteMany({ where: { id } });
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function getCurrentUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) throw new AppError("UNAUTHENTICATED", "Please sign in to continue.", 401);
  const session = await prisma.authSession.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.authSession.delete({ where: { id } });
    throw new AppError("UNAUTHENTICATED", "Your session has expired. Please sign in again.", 401);
  }
  return session.user;
}

export function hashResetToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

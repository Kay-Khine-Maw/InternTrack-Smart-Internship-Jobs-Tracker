import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, normalizeEmail, verifyPassword } from "@/lib/server/auth";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address."), password: z.string().min(1, "Password is required.") });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid sign-in data." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(parsed.data.email) } });
  if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ message: "Email or password is incorrect." }, { status: 401 });
  }
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}

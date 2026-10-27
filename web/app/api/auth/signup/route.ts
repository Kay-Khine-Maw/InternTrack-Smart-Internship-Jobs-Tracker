import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordHash, createSession, normalizeEmail } from "@/lib/server/auth";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid sign-up data." }, { status: 400 });
  const email = normalizeEmail(parsed.data.email);
  try {
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) throw new Error("EMAIL_EXISTS");
      const next = await tx.user.create({ data: { name: parsed.data.name.trim(), email, passwordHash: createPasswordHash(parsed.data.password) } });
      return next;
    });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") return NextResponse.json({ message: "An account with that email already exists." }, { status: 409 });
    return NextResponse.json({ message: "Could not create your account." }, { status: 500 });
  }
}

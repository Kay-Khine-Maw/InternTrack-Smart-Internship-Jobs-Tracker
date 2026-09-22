import "server-only";
import { prisma } from "@/lib/prisma";
import { databaseError } from "./errors";

export const DEMO_USER_ID = process.env.DEMO_USER_ID || "demo-user-nway";

export async function getDemoUser() {
  try {
    const byEnv = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
    if (byEnv) return byEnv;
    const first = await prisma.user.findFirst();
    if (first) return first;
    return prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "nway@interntrack.local",
        name: "Nway",
      },
    });
  } catch (error) {
    throw databaseError(error);
  }
}

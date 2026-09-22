import { NextResponse } from "next/server";
import { z } from "zod";
import { translateTextToEnglish } from "@/lib/ai/translateText";
import { AppError, isAppError } from "@/lib/server/errors";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  text: z.string().trim().min(1, "There is no text to translate."),
  target: z.string().optional(),
  field: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "There is no text to translate.";
      return NextResponse.json({ message, code: "VALIDATION" }, { status: 400 });
    }
    const translatedText = await translateTextToEnglish(parsed.data.text, parsed.data.field);
    return NextResponse.json({
      originalText: parsed.data.text,
      translatedText,
    });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Could not translate this field.";
    return NextResponse.json({ message, code: "AI_FAILURE" }, { status: error instanceof AppError ? error.status : 502 });
  }
}

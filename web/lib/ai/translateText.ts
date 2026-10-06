import "server-only";
import { AppError } from "@/lib/server/errors";

const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";
const MODELS = ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-flash-latest"];

function sanitize(message: string, apiKey?: string) {
  let next = message.replace(/\s+/g, " ").trim();
  if (apiKey) next = next.split(apiKey).join("[redacted]");
  return next.slice(0, 280);
}

function collectText(payload: unknown): string {
  const parts =
    (payload as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    })?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function parseTranslated(raw: string): string {
  const trimmed = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsed = JSON.parse(trimmed) as { translatedText?: unknown; text?: unknown };
    const value = String(parsed.translatedText ?? parsed.text ?? "").trim();
    if (value) return value.replace(/^["']|["']$/g, "").trim();
  } catch {
    // plain text fallback
  }
  return trimmed.replace(/^["']|["']$/g, "").trim();
}

export async function translateTextToEnglish(text: string, field?: string) {
  const source = text.trim();
  if (!source) {
    throw new AppError("VALIDATION", "There is no text to translate.", 400);
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "AI_FAILURE",
      "Gemini is not configured. Set GEMINI_API_KEY in .env.local and restart the server.",
      503
    );
  }

  const prompt = [
    "Translate the following internship field into English.",
    "Return JSON only: {\"translatedText\":\"...\"}",
    "Do not add quotes, labels, or explanation besides that JSON.",
    "If the text is already English, return it unchanged.",
    "Thai place names such as กรุงเทพฯ should become Bangkok.",
    field ? `Field: ${field}` : null,
    "Text:",
    source,
  ]
    .filter(Boolean)
    .join("\n");

  const models = Array.from(new Set([process.env.GEMINI_MODEL?.trim(), ...MODELS].filter(Boolean))) as string[];
  let lastError: unknown;

  for (const model of models) {
    for (const useSchema of [true, false]) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0,
              responseMimeType: "application/json",
              ...(useSchema
                ? {
                    responseSchema: {
                      type: "OBJECT",
                      properties: { translatedText: { type: "STRING" } },
                      required: ["translatedText"],
                    },
                  }
                : {}),
            },
          }),
        });
        const raw = await response.text();
        let payload: unknown = null;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = null;
        }
        if (!response.ok) {
          const message = sanitize(
            (payload as { error?: { message?: string } })?.error?.message || raw || `Gemini HTTP ${response.status}`,
            apiKey
          );
          const error = new Error(message) as Error & { status?: number };
          error.status = response.status;
          if (
            response.status === 404 ||
            response.status === 400 ||
            response.status === 503 ||
            /INVALID_ARGUMENT|thinkingConfig|UNAVAILABLE|high demand/i.test(message)
          ) {
            lastError = error;
            continue;
          }
          throw error;
        }
        const translated = parseTranslated(collectText(payload));
        if (!translated) {
          lastError = new Error("empty translation");
          continue;
        }
        return translated;
      } catch (error) {
        lastError = error;
        const status = (error as { status?: number }).status;
        const message = error instanceof Error ? error.message : "";
        if (
          status === 404 ||
          status === 400 ||
          status === 503 ||
          /INVALID_ARGUMENT|thinkingConfig|UNAVAILABLE|high demand/i.test(message)
        ) {
          continue;
        }
        break;
      }
    }
  }

  const message = sanitize(lastError instanceof Error ? lastError.message : "Translation failed.", apiKey);
  throw new AppError("AI_FAILURE", message ? `Could not translate this field. ${message}` : "Could not translate this field.", 502);
}

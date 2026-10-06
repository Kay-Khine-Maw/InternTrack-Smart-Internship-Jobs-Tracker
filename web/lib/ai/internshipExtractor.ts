import "server-only";
import { AppError } from "@/lib/server/errors";
import { normalizeExtractedData } from "@/lib/extract-mapper";

export type ExtractedInternshipData = {
  companyName: string | null;
  position: string | null;
  location: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string[];
  requiredDocuments: string[];
  applicationUrl: string | null;
  hrEmail: string | null;
  skills: string[];
};

export type ExtractionResult = {
  data: ExtractedInternshipData;
  missingFields: string[];
  confidence: "high" | "medium" | "low";
};

export type InternshipExtractorInput = {
  rawText: string;
  sourceUrl?: string;
};

const MAX_CHARS = 24_000;

const LANGUAGE_RULE = `Extract information exactly as written in the job post.
Preserve the original language.
Do not translate automatically.
Return the extracted text in the same language as the source.`;

const SYSTEM_PROMPT = `You are an internship information extraction assistant.
Extract only information explicitly available.
If information is missing, return null.
Do not guess.

Handle different job post formats. Never invent company or documents.
Extract the application deadline only if explicitly mentioned.
If the job post does not contain a deadline, return null.
Never infer, estimate, or create a deadline.
When a deadline is explicit, use ISO date (YYYY-MM-DD).
requirements and skills must be arrays of short strings.
requiredDocuments only if listed (Resume, Transcript, Cover Letter, Portfolio, etc.).
location: extract the workplace when present in any language (city, campus, office, Remote, Hybrid, กรุงเทพฯ, Bangkok). Do not leave location null if a place is written.
description: copy the visible role or program summary into description. Use body paragraphs when present. Do not leave description null if the post has a role summary.
applicationUrl: Extract only valid web URLs related to applying for the internship. Do not extract email addresses, phone numbers, or contact information. If no application URL exists, return null.
hrEmail: extract HR or application contact emails (for example hr@company.com). Never put an email in applicationUrl.
${LANGUAGE_RULE}`;

const VISION_PROMPT = `You are an internship information extraction assistant.
Extract only what is visible on the poster or screenshot.
If a field is not visible, return null.
Do not invent a company if only a program name is shown.
companyName can be the organization if visible, or the program host.
position can be the program title (for example "Industry-Oriented Internship Program") or Intern if that is the posting.
Do not guess documents or URLs that are not visible.
Extract the application deadline only if explicitly mentioned.
If the job post does not contain a deadline, return null.
Never infer, estimate, or create a deadline.
When a deadline is explicit, use ISO date (YYYY-MM-DD).
location: extract the workplace when visible in any language (city, campus, office, Remote, Hybrid, กรุงเทพฯ, Bangkok). Do not leave location null if a place is shown.
description: copy visible role or program summary paragraphs into description. Do not leave description null if the poster has a body summary.
applicationUrl: Extract only valid web URLs related to applying for the internship. Do not extract email addresses, phone numbers, or contact information. If no application URL exists, return null.
hrEmail: extract HR or application contact emails (for example hr@company.com). Never put an email in applicationUrl.
${LANGUAGE_RULE}
Return JSON only.`;

const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

const GEMINI_MODELS = [
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
];

const VISION_MODELS = ["gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-flash-latest"];

const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    companyName: { type: "STRING", nullable: true },
    position: { type: "STRING", nullable: true },
    location: { type: "STRING", nullable: true },
    deadline: { type: "STRING", nullable: true },
    description: { type: "STRING", nullable: true },
    requirements: { type: "ARRAY", items: { type: "STRING" } },
    requiredDocuments: { type: "ARRAY", items: { type: "STRING" } },
    applicationUrl: { type: "STRING", nullable: true },
    hrEmail: { type: "STRING", nullable: true },
    skills: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "companyName",
    "position",
    "location",
    "deadline",
    "description",
    "requirements",
    "requiredDocuments",
    "applicationUrl",
    "hrEmail",
    "skills",
  ],
};

const OPENAI_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    companyName: { type: ["string", "null"] },
    position: { type: ["string", "null"] },
    location: { type: ["string", "null"] },
    deadline: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    requirements: { type: "array", items: { type: "string" } },
    requiredDocuments: { type: "array", items: { type: "string" } },
    applicationUrl: { type: ["string", "null"] },
    hrEmail: { type: ["string", "null"] },
    skills: { type: "array", items: { type: "string" } },
  },
  required: [
    "companyName",
    "position",
    "location",
    "deadline",
    "description",
    "requirements",
    "requiredDocuments",
    "applicationUrl",
    "hrEmail",
    "skills",
  ],
} as const;

function emptyData(): ExtractedInternshipData {
  return {
    companyName: null,
    position: null,
    location: null,
    deadline: null,
    description: null,
    requirements: [],
    requiredDocuments: [],
    applicationUrl: null,
    hrEmail: null,
    skills: [],
  };
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isoDeadline(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function computeMissing(data: ExtractedInternshipData) {
  const missingFields: string[] = [];
  if (!data.companyName) missingFields.push("companyName");
  if (!data.position) missingFields.push("position");
  if (!data.location) missingFields.push("location");
  if (!data.description) missingFields.push("description");
  if (data.requiredDocuments.length === 0) missingFields.push("requiredDocuments");
  if (data.requirements.length === 0) missingFields.push("requirements");
  if (data.skills.length === 0) missingFields.push("skills");
  if (!data.applicationUrl) missingFields.push("applicationUrl");

  const keyMissing = ["companyName", "requiredDocuments"].filter((key) =>
    missingFields.includes(key)
  );
  let confidence: ExtractionResult["confidence"] = "high";
  if (!data.companyName || keyMissing.length >= 2) confidence = "low";
  else if (keyMissing.length === 1 || missingFields.length >= 3) confidence = "medium";

  return { missingFields, confidence };
}

function parsePayload(raw: unknown): ExtractedInternshipData {
  if (!raw || typeof raw !== "object") {
    throw new AppError("AI_FAILURE", "The AI returned invalid JSON. Please try again.", 502);
  }
  return normalizeExtractedData(raw);
}

function parseJsonContent(content: string) {
  const trimmed = content.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new AppError("AI_FAILURE", "The AI returned invalid JSON. Please try again.", 502);
  }
}

function buildUserContent(rawText: string, sourceUrl?: string) {
  return [
    sourceUrl ? `Source URL: ${sourceUrl}` : null,
    "Job posting text:",
    rawText.slice(0, MAX_CHARS),
    "Return only JSON with keys: companyName, position, location, deadline, description, requirements, requiredDocuments, applicationUrl, hrEmail, skills.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function sanitizeAiMessage(message: string, apiKey?: string) {
  let next = message.replace(/\s+/g, " ").trim();
  if (apiKey) next = next.split(apiKey).join("[redacted]");
  return next.slice(0, 280);
}

function googleErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const error = (payload as { error?: { message?: string; status?: string; code?: number } }).error;
  return error?.message || fallback;
}

function modelList(preferred?: string) {
  const first = preferred?.trim();
  return Array.from(
    new Set([first, ...GEMINI_MODELS].filter((item): item is string => Boolean(item)))
  );
}

type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };

async function generateWithGeminiRest(
  apiKey: string,
  model: string,
  parts: GeminiPart[],
  withSchema: boolean,
  systemPrompt = SYSTEM_PROMPT
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        ...(withSchema ? { responseSchema: GEMINI_RESPONSE_SCHEMA } : {}),
      },
    }),
  });

  const raw = await response.text();
  const sanitized = sanitizeAiMessage(raw, apiKey);
  let payload: unknown = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = googleErrorMessage(payload, sanitized || `Gemini HTTP ${response.status}`);
    const error = new Error(detail) as Error & { status?: number; model?: string };
    error.status = response.status;
    error.model = model;
    throw error;
  }

  const text = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  })?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";

  if (!text.trim()) {
    throw new AppError("AI_FAILURE", "The AI returned an empty response. Please try again.", 502);
  }
  return text;
}

async function extractWithGemini(apiKey: string, userContent: string): Promise<ExtractionResult> {
  const models = modelList(process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL);
  let lastError: unknown;

  for (const modelName of models) {
    for (const withSchema of [true, false]) {
      try {
        const content = await generateWithGeminiRest(apiKey, modelName, [{ text: userContent }], withSchema);
        const data = parsePayload(parseJsonContent(content));
        return { data, ...computeMissing(data) };
      } catch (error) {
        lastError = error;
        if (error instanceof AppError) throw error;
        const status = (error as { status?: number }).status;
        const message = error instanceof Error ? error.message : "";
        if (status === 404 || /NOT_FOUND|no longer available|is not found/i.test(message)) {
          break;
        }
        if (status === 503 || /UNAVAILABLE|high demand/i.test(message)) {
          break;
        }
        if (withSchema && /INVALID_ARGUMENT|schema|responseSchema/i.test(message)) {
          continue;
        }
        throw mapAiError(error, "gemini", apiKey);
      }
    }
  }

  throw mapAiError(lastError, "gemini", apiKey);
}

export type InternshipImageExtractorInput = {
  buffer: Buffer;
  mimeType?: string;
  filename?: string;
};

function imageMimeType(filename?: string, mimeType?: string) {
  const type = (mimeType || "").toLowerCase();
  if (type === "image/png" || type === "image/jpeg" || type === "image/jpg") {
    return type === "image/jpg" ? "image/jpeg" : type;
  }
  const name = (filename || "").toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

async function extractWithGeminiVision(
  apiKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const queue = Array.from(
    new Set(
      [process.env.GEMINI_MODEL?.trim(), ...VISION_MODELS].filter((item): item is string => Boolean(item))
    )
  );
  let lastError: unknown;
  const parts: GeminiPart[] = [
    {
      text: "Extract internship fields from this poster or screenshot. Return the same JSON schema. Use only visible text.",
    },
    { inline_data: { mime_type: mimeType, data: buffer.toString("base64") } },
  ];

  for (const modelName of queue) {
    for (const withSchema of [true, false]) {
      try {
        const content = await generateWithGeminiRest(apiKey, modelName, parts, withSchema, VISION_PROMPT);
        const data = parsePayload(parseJsonContent(content));
        return { data, ...computeMissing(data) };
      } catch (error) {
        lastError = error;
        if (error instanceof AppError) {
          if (/empty response/i.test(error.message)) break;
          throw error;
        }
        const status = (error as { status?: number }).status;
        const message = error instanceof Error ? error.message : "";
        if (status === 404 || /NOT_FOUND|no longer available|is not found/i.test(message)) {
          break;
        }
        if (status === 503 || /UNAVAILABLE|high demand/i.test(message)) {
          break;
        }
        if (withSchema && /INVALID_ARGUMENT|schema|responseSchema/i.test(message)) {
          continue;
        }
        if (
          status === 400 ||
          /does not support|INLINE_DATA|image input|modality|unsupported/i.test(message)
        ) {
          break;
        }
        throw mapAiError(error, "gemini", apiKey);
      }
    }
  }

  throw mapAiError(lastError, "gemini", apiKey);
}

export async function extractInternshipFromImage(
  input: InternshipImageExtractorInput
): Promise<ExtractionResult> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) {
    throw new AppError(
      "AI_FAILURE",
      "Gemini is not configured. Set GEMINI_API_KEY in .env.local and restart the server.",
      503
    );
  }
  if (!input.buffer?.length) {
    throw new AppError("EXTRACT_FAILURE", "Could not read this image. Try a clearer photo or a PDF.", 400);
  }

  try {
    return await extractWithGeminiVision(geminiKey, input.buffer, imageMimeType(input.filename, input.mimeType));
  } catch (error) {
    throw mapAiError(error, "gemini", geminiKey);
  }
}

async function extractWithOpenAI(apiKey: string, userContent: string): Promise<ExtractionResult> {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey, timeout: 45_000 });
  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "internship_extraction",
        strict: true,
        schema: OPENAI_JSON_SCHEMA,
      },
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new AppError("AI_FAILURE", "The AI returned an empty response. Please try again.", 502);
  }
  const data = parsePayload(parseJsonContent(content));
  return { data, ...computeMissing(data) };
}

function mapAiError(error: unknown, provider: "gemini" | "openai", apiKey?: string) {
  if (error instanceof AppError) return error;
  const message = sanitizeAiMessage(error instanceof Error ? error.message : "Unknown AI error", apiKey);
  const status = (error as { status?: number }).status;

  if (/timeout|ETIMEDOUT|AbortError/i.test(message)) {
    return new AppError("AI_FAILURE", "The AI request timed out. Please try again.", 502);
  }
  if (status === 401 || status === 403 || /API_KEY_INVALID|unauthenticated|invalid api key/i.test(message)) {
    return new AppError(
      "AI_FAILURE",
      provider === "gemini"
        ? "Gemini rejected this API key. Use a Google AI Studio key (usually starts with AIza) in GEMINI_API_KEY, then restart the server."
        : "OpenAI rejected the API key. Check OPENAI_API_KEY.",
      503
    );
  }
  if (status === 404 || /NOT_FOUND|no longer available|is not found/i.test(message)) {
    const failed = (error as { model?: string }).model || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    return new AppError(
      "AI_FAILURE",
      `Gemini model "${failed}" was not found for this API key. Set GEMINI_MODEL=${DEFAULT_GEMINI_MODEL} (confirmed working via ListModels) and retry.`,
      502
    );
  }
  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) {
    return new AppError("AI_FAILURE", "Gemini quota or rate limit was reached. Try again later.", 502);
  }
  if (status === 503 || /UNAVAILABLE|high demand/i.test(message)) {
    return new AppError(
      "AI_FAILURE",
      "Gemini is temporarily unavailable due to high demand. Please try extract again in a moment.",
      502
    );
  }
  if (message) {
    return new AppError("AI_FAILURE", `AI extraction failed: ${message}`, 502);
  }
  return new AppError("AI_FAILURE", "AI extraction failed. Please try again.", 502);
}

export async function extractInternshipFromText(
  input: InternshipExtractorInput
): Promise<ExtractionResult> {
  const rawText = input.rawText?.trim() ?? "";
  if (!rawText) {
    throw new AppError("EXTRACT_FAILURE", "No text was available to analyze.", 400);
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!geminiKey && !openaiKey) {
    throw new AppError(
      "AI_FAILURE",
      "Gemini is not configured. Set GEMINI_API_KEY in .env.local and restart the server.",
      503
    );
  }

  const userContent = buildUserContent(rawText, input.sourceUrl);

  try {
    if (geminiKey) return await extractWithGemini(geminiKey, userContent);
    return await extractWithOpenAI(openaiKey!, userContent);
  } catch (error) {
    throw mapAiError(error, geminiKey ? "gemini" : "openai", geminiKey || openaiKey);
  }
}

export { emptyData };

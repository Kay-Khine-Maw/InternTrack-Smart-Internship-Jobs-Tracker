import "server-only";
import { createHash } from "node:crypto";
import { AppError } from "@/lib/server/errors";
import type { StudentProfile } from "@/lib/profile";
import type { MatchingRequirement } from "@/lib/matching";

const MODELS = ["gemini-3.8-flash", "gemini-flash-lite-latest", "gemini-flash-latest"];

const PROMPT = `You decide how well a student profile matches a job's requirements.
Compare related wording, such as "machine learning" and "ML models".
Use only the profile and requirements provided. Do not invent facts.
Return JSON only: {"percentage": <integer from 0 to 100>}.`;

function profileFacts(profile: StudentProfile) {
  return {
    major: profile.major,
    year: profile.year,
    bio: profile.bio,
    university: profile.university,
    location: profile.location,
    preferredFields: profile.preferredFields,
    preferredLocation: profile.preferredLocation,
    skills: profile.skills,
    tools: profile.tools,
    summary: profile.resumeSummary,
    education: profile.resumeEducation,
    experience: profile.resumeExperience,
    projects: profile.resumeProjects,
    languages: profile.resumeLanguages,
    internshipPeriod: profile.internshipPeriod,
  };
}

function clampPercentage(value: unknown) {
  const percentage = Number(value);
  if (!Number.isFinite(percentage)) return null;
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

function percentageFromPayload(payload: unknown) {
  const parts = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }> })
    .candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter((part) => !part.thought).map((part) => part.text ?? "").join("").trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as { percentage?: unknown };
    const percentage = clampPercentage(parsed.percentage);
    if (percentage !== null) return percentage;
  } catch {
    const match = cleaned.match(/"percentage"\s*:\s*(\d{1,3})/);
    if (match) return clampPercentage(match[1]);
  }
  return null;
}

const scoreCache = new Map<string, number>();
const scoreRequests = new Map<string, Promise<number>>();

async function requestPercentage(profile: StudentProfile, requirements: MatchingRequirement[], jobText: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError("AI_FAILURE", "Gemini is not configured. Set GEMINI_API_KEY in .env.local and restart the server.", 503);
  }
  const models = Array.from(new Set([process.env.GEMINI_MODEL?.trim(), ...MODELS].filter((model): model is string => Boolean(model)))).slice(0, 2);
  const body = JSON.stringify({ profile: profileFacts(profile), requirements, jobText: jobText.slice(0, 8_000) });
  let lastMessage = "Gemini could not calculate this match.";

  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROMPT }] },
          contents: [{ role: "user", parts: [{ text: body.slice(0, 24_000) }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
      });
      const raw = await response.text();
      if (!response.ok) {
        try {
          lastMessage = (JSON.parse(raw) as { error?: { message?: string } }).error?.message || `Gemini HTTP ${response.status}`;
        } catch {
          lastMessage = `Gemini HTTP ${response.status}`;
        }
        continue;
      }
      const percentage = percentageFromPayload(JSON.parse(raw));
      if (percentage !== null) return percentage;
      lastMessage = "Gemini returned no match percentage.";
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : lastMessage;
    }
  }

  throw new AppError("AI_FAILURE", lastMessage.replace(/\s+/g, " ").split(apiKey).join("[redacted]").slice(0, 240), 502);
}

export async function aiProfileMatchPercentage(profile: StudentProfile, requirements: MatchingRequirement[], jobText = "") {
  const cacheKey = createHash("sha256")
    .update(JSON.stringify({ profile: profileFacts(profile), requirements, jobText }))
    .digest("hex");
  const cached = scoreCache.get(cacheKey);
  if (cached !== undefined) return cached;
  const pending = scoreRequests.get(cacheKey);
  if (pending) return pending;
  const request = requestPercentage(profile, requirements, jobText)
    .then((score) => {
      scoreCache.set(cacheKey, score);
      return score;
    })
    .finally(() => {
      scoreRequests.delete(cacheKey);
    });
  scoreRequests.set(cacheKey, request);
  return request;
}

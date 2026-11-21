import "server-only";

const NON_ENGLISH =
  /[\u0E00-\u0E7F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
const MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-2.5-flash"];

/** Common Thai skill/tag phrases → short English UI labels (deterministic, no API). */
const THAI_LABEL_FALLBACK: Record<string, string> = {
  การคิดวิเคราะห์: "Analytical Thinking",
  ทักษะการคิดวิเคราะห์: "Analytical Thinking",
  การวิเคราะห์: "Analysis",
  การวิเคราะห์ข้อมูล: "Data Analysis",
  การสื่อสาร: "Communication",
  ทักษะการสื่อสาร: "Communication",
  การทำงานเป็นทีม: "Teamwork",
  ทำงานเป็นทีม: "Teamwork",
  ความคิดสร้างสรรค์: "Creativity",
  การแก้ปัญหา: "Problem Solving",
  ทักษะการแก้ปัญหา: "Problem Solving",
  ความเป็นผู้นำ: "Leadership",
  การจัดการเวลา: "Time Management",
  ภาษาอังกฤษ: "English",
  ภาษาไทย: "Thai",
  คอมพิวเตอร์: "Computer Literacy",
  โปรแกรมเมอร์: "Programming",
  การเขียนโปรแกรม: "Programming",
  พัฒนาซอฟต์แวร์: "Software Development",
  ออกแบบ: "Design",
  การตลาด: "Marketing",
  การบัญชี: "Accounting",
  การเงิน: "Finance",
  บริการลูกค้า: "Customer Service",
};

export function needsEnglishLabel(value: string) {
  return NON_ENGLISH.test(value);
}

function cleanLabel(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

function fallbackEnglish(label: string) {
  const cleaned = cleanLabel(label);
  if (!cleaned) return cleaned;
  const direct = THAI_LABEL_FALLBACK[cleaned];
  if (direct) return direct;
  const compact = cleaned.replace(/\s+/g, "");
  if (THAI_LABEL_FALLBACK[compact]) return THAI_LABEL_FALLBACK[compact];
  for (const [thai, english] of Object.entries(THAI_LABEL_FALLBACK)) {
    if (cleaned.includes(thai)) return english;
  }
  return cleaned;
}

/**
 * Returns short English UI labels for the given strings.
 * Already-English labels are kept. Failures fall back to the original text
 * (or a deterministic Thai dictionary when available).
 */
export async function toEnglishShortLabels(labels: string[]): Promise<string[]> {
  const cleaned = labels.map((label) => cleanLabel(label));
  const withFallback = cleaned.map((label) =>
    label && needsEnglishLabel(label) ? fallbackEnglish(label) : label,
  );

  const pendingIndexes: number[] = [];
  const pendingValues: string[] = [];
  withFallback.forEach((label, index) => {
    if (label && needsEnglishLabel(label)) {
      pendingIndexes.push(index);
      pendingValues.push(label);
    }
  });
  if (!pendingValues.length) return withFallback;

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return withFallback;

  const models = Array.from(
    new Set([process.env.GEMINI_MODEL?.trim(), ...MODELS].filter((model): model is string => Boolean(model))),
  ).slice(0, 2);
  const prompt = [
    "Convert each internship skill, tool, or tag into a short English UI label.",
    "Keep product names like Excel, SQL, and Python unchanged.",
    "Translate Thai or other non-English phrases into concise English (for example analytical thinking).",
    "Do not invent new requirements. Do not add commentary.",
    'Return JSON only: {"labels":[{"source":"<exact input>","english":"<short English label>"}]}',
    "Inputs:",
    JSON.stringify(pendingValues),
  ].join("\n");

  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        signal: AbortSignal.timeout(20_000),
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
      });
      if (!response.ok) continue;
      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
      };
      const text = (payload.candidates?.[0]?.content?.parts ?? [])
        .filter((part) => !part.thought)
        .map((part) => part.text ?? "")
        .join("")
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed = JSON.parse(text) as { labels?: Array<{ source?: unknown; english?: unknown }> };
      if (!Array.isArray(parsed.labels)) continue;
      const bySource = new Map<string, string>();
      for (const item of parsed.labels) {
        const source = cleanLabel(String(item.source ?? ""));
        const english = cleanLabel(String(item.english ?? ""));
        if (!source || !english || needsEnglishLabel(english)) continue;
        bySource.set(source.toLowerCase(), english);
      }
      const next = [...withFallback];
      pendingIndexes.forEach((index, order) => {
        const source = pendingValues[order] ?? "";
        const english = bySource.get(source.toLowerCase());
        if (english) next[index] = english;
      });
      return next;
    } catch {
      // try next model
    }
  }

  return withFallback;
}

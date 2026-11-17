export type ProfileMatchAssessment = {
  percentage: number;
  explanation: string;
};

function clampPercentage(value: unknown) {
  const percentage = Number(value);
  if (!Number.isFinite(percentage)) return null;
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

function explanationFrom(value: unknown) {
  if (typeof value !== "string") return null;
  const explanation = value.replace(/\s+/g, " ").trim();
  if (explanation.length < 20) return null;
  return explanation.slice(0, 1200);
}

export function parseMatchAssessmentText(text: string): ProfileMatchAssessment | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as { percentage?: unknown; explanation?: unknown };
    const percentage = clampPercentage(parsed.percentage);
    const explanation = explanationFrom(parsed.explanation);
    if (percentage !== null && explanation) return { percentage, explanation };
  } catch {
    const percentageMatch = cleaned.match(/"percentage"\s*:\s*(\d{1,3})/);
    const explanationMatch = cleaned.match(/"explanation"\s*:\s*"((?:\\.|[^"\\])*)"/);
    const percentage = percentageMatch ? clampPercentage(percentageMatch[1]) : null;
    const explanation = explanationMatch ? explanationFrom(explanationMatch[1].replace(/\\n/g, " ").replace(/\\"/g, "\"")) : null;
    if (percentage !== null && explanation) return { percentage, explanation };
  }
  return null;
}

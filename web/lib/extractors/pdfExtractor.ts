import "server-only";
import { AppError } from "@/lib/server/errors";

function readableText(text: string, preserveLines: boolean) {
  if (!preserveLines) return text.replace(/\s+/g, " ").trim();
  return text.replace(/\r\n/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractFromPdf(buffer: Buffer, filename?: string, options?: { preserveLines?: boolean }) {
  const pdfParse = (await import("pdf-parse")).default as (data: Buffer) => Promise<{ text: string }>;
  try {
    const result = await pdfParse(buffer);
    const textContent = readableText(result.text ?? "", Boolean(options?.preserveLines));
    if (!textContent) {
      throw new AppError("EXTRACT_FAILURE", "The PDF did not contain readable text.", 400);
    }
    return { textContent, filename };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("EXTRACT_FAILURE", "Could not read this PDF. Try another file.", 400);
  }
}

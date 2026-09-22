import "server-only";
import { AppError } from "@/lib/server/errors";

export async function extractFromPdf(buffer: Buffer, filename?: string) {
  const pdfParse = (await import("pdf-parse")).default as (data: Buffer) => Promise<{ text: string }>;
  try {
    const result = await pdfParse(buffer);
    const textContent = (result.text ?? "").replace(/\s+/g, " ").trim();
    if (!textContent) {
      throw new AppError("EXTRACT_FAILURE", "The PDF did not contain readable text.", 400);
    }
    return { textContent, filename };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("EXTRACT_FAILURE", "Could not read this PDF. Try another file.", 400);
  }
}

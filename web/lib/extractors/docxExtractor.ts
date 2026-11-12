import "server-only";
import mammoth from "mammoth";
import { AppError } from "@/lib/server/errors";

function readableText(text: string, preserveLines: boolean) {
  if (!preserveLines) return text.replace(/\s+/g, " ").trim();
  return text.replace(/\r\n/g, "\n").replace(/[^\S\n]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractFromDocx(buffer: Buffer, filename?: string, options?: { preserveLines?: boolean }) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const textContent = readableText(result.value ?? "", Boolean(options?.preserveLines));
    if (!textContent) {
      throw new AppError("EXTRACT_FAILURE", "The Word document did not contain readable text.", 400);
    }
    return { textContent, filename };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("EXTRACT_FAILURE", "Could not read this DOCX file. Try another file.", 400);
  }
}

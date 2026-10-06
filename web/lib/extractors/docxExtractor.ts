import "server-only";
import mammoth from "mammoth";
import { AppError } from "@/lib/server/errors";

export async function extractFromDocx(buffer: Buffer, filename?: string) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const textContent = (result.value ?? "").replace(/\s+/g, " ").trim();
    if (!textContent) {
      throw new AppError("EXTRACT_FAILURE", "The Word document did not contain readable text.", 400);
    }
    return { textContent, filename };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("EXTRACT_FAILURE", "Could not read this DOCX file. Try another file.", 400);
  }
}

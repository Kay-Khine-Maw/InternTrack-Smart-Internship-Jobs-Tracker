import { NextResponse } from "next/server";
import { extractFromDocx } from "@/lib/extractors/docxExtractor";
import { extractFromPdf } from "@/lib/extractors/pdfExtractor";
import { extractResumeFromText } from "@/lib/ai/resumeExtractor";
import { AppError, isAppError } from "@/lib/server/errors";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

function errorResponse(error: unknown) {
  if (isAppError(error)) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  return NextResponse.json({ message: "Could not process this resume.", code: "RESUME_FAILURE" }, { status: 502 });
}

export async function POST(request: Request) {
  try {
    await getCurrentUser();
    const form = await request.formData();
    const value = form.get("file");
    if (!value || typeof value === "string" || typeof (value as File).arrayBuffer !== "function") {
      throw new AppError("VALIDATION", "Choose a PDF or DOCX resume.", 400);
    }
    const file = value as File;
    if (!file.size) throw new AppError("VALIDATION", "The resume is empty.", 400);
    if (file.size > MAX_BYTES) throw new AppError("UNSUPPORTED_FILE", "That resume is larger than 10MB.", 413);
    const name = file.name.toLowerCase();
    const mime = file.type.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let textContent: string;
    if (name.endsWith(".pdf") || mime === "application/pdf") {
      textContent = (await extractFromPdf(buffer, file.name)).textContent;
    } else if (
      name.endsWith(".docx") ||
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      textContent = (await extractFromDocx(buffer, file.name)).textContent;
    } else {
      throw new AppError("UNSUPPORTED_FILE", "Unsupported resume type. Upload a PDF or DOCX file.", 400);
    }
    const draft = await extractResumeFromText(textContent);
    return NextResponse.json({ draft });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { extractInternshipFromImage, extractInternshipFromText } from "@/lib/ai/internshipExtractor";
import type { ExtractionResult } from "@/lib/ai/internshipExtractor";
import { extractFromDocx } from "@/lib/extractors/docxExtractor";
import { extractFromImage } from "@/lib/extractors/imageExtractor";
import { extractFromPdf } from "@/lib/extractors/pdfExtractor";
import { extractFromUrl } from "@/lib/extractors/urlExtractor";
import { findDuplicateInternship } from "@/lib/server/duplicates";
import { AppError, databaseError, isAppError } from "@/lib/server/errors";
import { getDemoUser } from "@/lib/server/demoUser";
import { prisma } from "@/lib/prisma";
import { hasAnyExtractedField, hydrateFromSourceText } from "@/lib/extract-mapper";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024;

function jsonError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }
  const mapped = databaseError(error);
  if (mapped.code === "DATABASE_FAILURE" && /database|prisma|connect/i.test(String(error))) {
    return NextResponse.json({ message: mapped.message, code: mapped.code }, { status: mapped.status });
  }
  const message = error instanceof Error ? error.message : "Unexpected extraction error.";
  return NextResponse.json({ message, code: "EXTRACT_FAILURE" }, { status: 502 });
}

function asUploadedFile(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string") return null;
  const candidate = value as { name?: string; size?: number; type?: string; arrayBuffer?: () => Promise<ArrayBuffer> };
  if (typeof candidate.arrayBuffer !== "function") return null;
  return {
    name: candidate.name || "upload",
    size: Number(candidate.size) || 0,
    type: candidate.type || "",
    arrayBuffer: () => candidate.arrayBuffer!(),
  };
}

function detectKind(filename: string, mime: string) {
  const name = filename.toLowerCase();
  const type = mime.toLowerCase();
  if (name.endsWith(".pdf") || type === "application/pdf") return "pdf" as const;
  if (
    name.endsWith(".docx") ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx" as const;
  }
  if (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    type === "image/png" ||
    type === "image/jpeg"
  ) {
    return "image" as const;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let sourceUrl: string | undefined;
    let filename: string | undefined;
    let textContent = "";
    let title = "";
    let sourceType: "url" | "file" = "url";
    let usedVision = false;
    let imageUpload = false;
    let extraction: ExtractionResult | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const urlField = String(form.get("url") ?? "").trim();
      const file = asUploadedFile(form.get("file"));
      if (file && file.size > 0) {
        if (file.size > MAX_BYTES) {
          throw new AppError(
            "UNSUPPORTED_FILE",
            "That file is larger than 10MB. Please upload a smaller PDF, DOCX, PNG, or JPG.",
            413
          );
        }
        const kind = detectKind(file.name, file.type);
        if (!kind) {
          throw new AppError(
            "UNSUPPORTED_FILE",
            "Unsupported file type. Please upload a PDF, DOCX, PNG, or JPG.",
            400
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
        sourceType = "file";
        if (kind === "pdf") {
          const extracted = await extractFromPdf(buffer, file.name);
          textContent = extracted.textContent;
        } else if (kind === "docx") {
          const extracted = await extractFromDocx(buffer, file.name);
          textContent = extracted.textContent;
        } else {
          imageUpload = true;
          try {
            extraction = await extractInternshipFromImage({
              buffer,
              mimeType: file.type,
              filename: file.name,
            });
            usedVision = true;
            if (!hasAnyExtractedField(extraction.data)) {
              extraction = null;
              usedVision = false;
            }
          } catch {
            extraction = null;
            usedVision = false;
          }

          if (!extraction) {
            try {
              const extracted = await extractFromImage(buffer, file.name);
              textContent = extracted.textContent;
            } catch {
              throw new AppError(
                "EXTRACT_FAILURE",
                "Could not read this image. Try a clearer photo or a PDF.",
                400
              );
            }
          }
          console.info("[extract]", { usedVision, ocrLength: textContent.length });
        }
        title = file.name;
      } else if (urlField) {
        const page = await extractFromUrl(urlField);
        textContent = page.textContent;
        title = page.title;
        sourceUrl = page.sourceUrl;
      } else {
        throw new AppError("VALIDATION", "Provide a job URL or upload a PDF, DOCX, PNG, or JPG.", 400);
      }
    } else {
      const body = (await request.json().catch(() => null)) as { url?: string } | null;
      const url = body?.url?.trim();
      if (!url) {
        throw new AppError("VALIDATION", "Provide a job URL or upload a PDF, DOCX, PNG, or JPG.", 400);
      }
      const page = await extractFromUrl(url);
      textContent = page.textContent;
      title = page.title;
      sourceUrl = page.sourceUrl;
    }

    let historyId: string | null = null;
    try {
      const user = await getDemoUser();
      const history = await prisma.extractionHistory.create({
        data: {
          sourceType,
          sourceUrl: sourceUrl ?? null,
          filename: filename ?? null,
          extractedText: textContent.slice(0, 100_000),
          userId: user.id,
        },
      });
      historyId = history.id;
    } catch (error) {
      throw databaseError(error);
    }

    if (!extraction) {
      extraction = await extractInternshipFromText({
        rawText: textContent,
        sourceUrl,
      });
    }
    if (textContent.trim()) {
      extraction.data = hydrateFromSourceText(textContent, extraction.data);
    }
    if (imageUpload && !hasAnyExtractedField(extraction.data)) {
      throw new AppError(
        "EXTRACT_FAILURE",
        "Could not read this image. Try a clearer photo or a PDF.",
        400
      );
    }

    if (historyId) {
      try {
        await prisma.extractionHistory.update({
          where: { id: historyId },
          data: { aiResult: extraction },
        });
      } catch {
        // History already captured raw text; AI snapshot is optional.
      }
    }

    if (!extraction.data.applicationUrl && sourceUrl) {
      extraction.data.applicationUrl = sourceUrl;
    }

    const submittedUrl = sourceUrl || extraction.data.applicationUrl;
    const match = submittedUrl
      ? await findDuplicateInternship({
          sourceUrl,
          applicationUrl: extraction.data.applicationUrl,
          urlOnly: true,
        })
      : undefined;

    return NextResponse.json({
      data: extraction.data,
      missingFields: extraction.missingFields,
      confidence: extraction.confidence,
      extractedText: textContent.slice(0, 4000),
      source: { title, sourceUrl: sourceUrl ?? null, filename: filename ?? null },
      extractionHistoryId: historyId,
      duplicate: match?.duplicate ?? null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

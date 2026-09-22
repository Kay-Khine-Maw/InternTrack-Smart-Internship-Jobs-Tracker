import "server-only";
import path from "node:path";
import { AppError } from "@/lib/server/errors";

const EMPTY_OCR_MESSAGE =
  "Could not read this image. Try a clearer photo or a PDF.";

async function loadTesseract() {
  const imported = await import(/* webpackIgnore: true */ "tesseract.js");
  return (imported as { createWorker?: unknown; default?: { createWorker?: unknown } }).createWorker
    ? (imported as typeof import("tesseract.js"))
    : ((imported as { default: typeof import("tesseract.js") }).default ?? imported);
}

export async function extractFromImage(buffer: Buffer, filename?: string) {
  if (!buffer?.length) {
    throw new AppError("EXTRACT_FAILURE", EMPTY_OCR_MESSAGE, 400);
  }

  let worker: Awaited<ReturnType<typeof import("tesseract.js").createWorker>> | undefined;
  try {
    const tesseract = await loadTesseract();
    const createWorker = (tesseract as { createWorker: typeof import("tesseract.js").createWorker }).createWorker;
    if (typeof createWorker !== "function") {
      throw new Error("tesseract.js createWorker is not available");
    }
    worker = await createWorker("eng", 1, {
      cachePath: path.join(process.cwd(), ".tessdata"),
      gzip: true,
    });
    const result = await worker.recognize(Buffer.from(buffer));
    const textContent = (result.data.text ?? "").replace(/\s+/g, " ").trim();
    if (textContent.length < 20) {
      throw new AppError("EXTRACT_FAILURE", EMPTY_OCR_MESSAGE, 400);
    }
    return { textContent, filename };
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    console.error("[ocr] tesseract failed:", message);
    if (/require is not a function|createRequire|Cannot find module|worker|wasm|ENOENT/i.test(message)) {
      throw new AppError(
        "EXTRACT_FAILURE",
        "Could not start image OCR on the server. Try again, or upload a PDF instead.",
        400
      );
    }
    throw new AppError("EXTRACT_FAILURE", EMPTY_OCR_MESSAGE, 400);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore terminate errors
      }
    }
  }
}

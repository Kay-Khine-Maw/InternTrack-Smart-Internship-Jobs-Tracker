import "server-only";
import * as cheerio from "cheerio";
import { AppError } from "@/lib/server/errors";
import { normalizeUrl } from "@/lib/utils";

export type UrlExtractResult = {
  title: string;
  textContent: string;
  sourceUrl: string;
};

const FETCH_TIMEOUT_MS = 15_000;
const PLAYWRIGHT_TIMEOUT_MS = 20_000;
const MAX_HTML_BYTES = 2_000_000;
const MIN_TEXT_CHARS = 300;
const USER_AGENT =
  "InternTrack/1.0 (university internship tracker; +https://localhost) Mozilla/5.0";

const STRIP_SELECTORS = [
  "nav",
  "footer",
  "header",
  "aside",
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "form",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  ".ad",
  ".ads",
  ".advertisement",
  ".cookie",
  ".cookie-banner",
  "#cookie",
  ".navbar",
  ".nav",
  ".menu",
  ".sidebar",
  ".footer",
  ".header",
].join(", ");

function validateHttpUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new AppError("INVALID_URL", "Please enter a valid http or https job URL.", 400);
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppError("INVALID_URL", "Please enter a valid http or https job URL.", 400);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AppError("INVALID_URL", "Please enter a valid http or https job URL.", 400);
  }
  return parsed.toString();
}

function cleanHtml(html: string) {
  const $ = cheerio.load(html);
  $(STRIP_SELECTORS).remove();
  const title = $("title").first().text().trim() || $("h1").first().text().trim();
  const main = $("main, article, [role='main']").first();
  const raw = (main.length ? main.text() : $("body").text()) || $.root().text();
  const textContent = raw.replace(/\s+/g, " ").trim();
  return { title, textContent };
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
    });
    if (response.status === 404) {
      throw new AppError("INVALID_URL", "That job page could not be found (404).", 400);
    }
    if (response.status === 403) {
      throw new AppError(
        "EXTRACT_FAILURE",
        "The site blocked the request (403). Try uploading the posting as a PDF instead.",
        502
      );
    }
    if (!response.ok) {
      throw new AppError(
        "EXTRACT_FAILURE",
        `Could not fetch the job page (HTTP ${response.status}).`,
        502
      );
    }
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > MAX_HTML_BYTES) {
      throw new AppError("EXTRACT_FAILURE", "The job page is too large to extract.", 400);
    }
    const html = await response.text();
    return html.slice(0, MAX_HTML_BYTES);
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("EXTRACT_FAILURE", "The job page timed out. Try again or upload a file.", 502);
    }
    throw new AppError(
      "EXTRACT_FAILURE",
      "Network failure while fetching the job URL. Check the link and try again.",
      502
    );
  } finally {
    clearTimeout(timer);
  }
}

async function extractWithPlaywright(url: string): Promise<UrlExtractResult> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ userAgent: USER_AGENT });
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: PLAYWRIGHT_TIMEOUT_MS,
      });
      if (response?.status() === 404) {
        throw new AppError("INVALID_URL", "That job page could not be found (404).", 400);
      }
      if (response?.status() === 403) {
        throw new AppError(
          "EXTRACT_FAILURE",
          "The site blocked the request (403). Try uploading the posting as a PDF instead.",
          502
        );
      }
      await page.waitForTimeout(800);
      const html = await page.content();
      const title = await page.title();
      const cleaned = cleanHtml(html);
      return {
        title: cleaned.title || title || url,
        textContent: cleaned.textContent,
        sourceUrl: normalizeUrl(url) || url,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/Executable doesn't exist|browserType.launch|playwright install/i.test(message)) {
      throw new AppError(
        "EXTRACT_FAILURE",
        "Playwright browsers are not installed. Run npx playwright install and try again.",
        502
      );
    }
    if (/Timeout/i.test(message)) {
      throw new AppError("EXTRACT_FAILURE", "The job page timed out. Try again or upload a file.", 502);
    }
    throw new AppError(
      "EXTRACT_FAILURE",
      "Could not extract readable text from this page. Try uploading a PDF instead.",
      502
    );
  }
}

export async function extractFromUrl(url: string): Promise<UrlExtractResult> {
  const sourceUrl = validateHttpUrl(url);
  const html = await fetchHtml(sourceUrl);
  const cheerioResult = cleanHtml(html);
  const looksJsApp =
    cheerioResult.textContent.length < MIN_TEXT_CHARS ||
    /enable javascript|you need to enable javascript/i.test(cheerioResult.textContent);

  if (!looksJsApp) {
    return {
      title: cheerioResult.title || sourceUrl,
      textContent: cheerioResult.textContent,
      sourceUrl: normalizeUrl(sourceUrl) || sourceUrl,
    };
  }

  const playwrightResult = await extractWithPlaywright(sourceUrl);
  if (playwrightResult.textContent.length < 40) {
    throw new AppError(
      "EXTRACT_FAILURE",
      "Could not extract readable text from this page after Cheerio and Playwright. Try uploading a PDF instead.",
      502
    );
  }
  return playwrightResult;
}

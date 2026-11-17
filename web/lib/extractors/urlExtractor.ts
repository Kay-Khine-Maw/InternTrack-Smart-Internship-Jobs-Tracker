import "server-only";
import * as cheerio from "cheerio";
import { toRoleDescription } from "@/lib/extract-mapper";
import { AppError } from "@/lib/server/errors";
import { normalizeUrl } from "@/lib/utils";

export type LinkedInPosting = {
  companyName: string | null;
  position: string | null;
  location: string | null;
  description: string | null;
  requirements: string[];
};

export type UrlExtractResult = {
  title: string;
  textContent: string;
  sourceUrl: string;
  linkedIn?: LinkedInPosting;
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

function linkedInGuestUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname)) return null;
    const jobId = parsed.pathname.match(/\/jobs\/view\/(\d+)/)?.[1];
    if (!jobId) return null;
    return `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
  } catch {
    return null;
  }
}

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

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function parseLinkedInPosting(html: string): LinkedInPosting | null {
  const $ = cheerio.load(html);
  const position = cleanText($("h2.topcard__title").first().text()) || null;
  const companyName = cleanText($("a.topcard__org-name-link").first().text()) || null;
  const location = cleanText($("span.topcard__flavor--bullet").first().text()) || null;
  const blocks: string[] = [];
  const requirements: string[] = [];
  let inQualifications = false;
  $(".show-more-less-html__markup").find("p, li").each((_, element) => {
    const text = cleanText($(element).text());
    if (!text) return;
    const node = $(element);
    if (node.is("p") && /^qualifications\b/i.test(text)) {
      inQualifications = true;
      blocks.push(text);
      return;
    }
    if (node.is("p") && /^(responsibilities|process)\b/i.test(text)) {
      inQualifications = false;
      blocks.push(text);
      return;
    }
    if (node.is("li")) {
      blocks.push(`- ${text}`);
      if (inQualifications) requirements.push(text);
      return;
    }
    blocks.push(text);
  });
  const description = toRoleDescription(blocks.join("\n"));
  if (!position && !companyName && !description) return null;
  return { companyName, position, location, description, requirements };
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
  const guestUrl = linkedInGuestUrl(sourceUrl);
  if (guestUrl) {
    try {
      const guestHtml = await fetchHtml(guestUrl);
      const guestResult = cleanHtml(guestHtml);
      const linkedIn = parseLinkedInPosting(guestHtml);
      if ((linkedIn && (linkedIn.position || linkedIn.companyName || linkedIn.description)) || guestResult.textContent.length >= 40) {
        return {
          title: linkedIn?.position || guestResult.title || sourceUrl,
          textContent: guestResult.textContent,
          sourceUrl: normalizeUrl(sourceUrl) || sourceUrl,
          ...(linkedIn ? { linkedIn } : {}),
        };
      }
    } catch {
      // The public job page is the fallback when the guest posting cannot be read.
    }
  }
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

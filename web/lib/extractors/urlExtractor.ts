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

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const FETCH_TIMEOUT_MS = IS_SERVERLESS ? 8_000 : 15_000;
const PLAYWRIGHT_TIMEOUT_MS = IS_SERVERLESS ? 12_000 : 20_000;
const MAX_HTML_BYTES = 2_000_000;
const MIN_TEXT_CHARS = 300;
// LinkedIn and similar sites rate-limit obvious bot / localhost user agents.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const FETCH_HEADERS: HeadersInit = {
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function fetchHeadersFor(url: string): HeadersInit {
  if (/linkedin\.com/i.test(url)) {
    return {
      ...FETCH_HEADERS,
      Referer: "https://www.linkedin.com/jobs/",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
    };
  }
  return FETCH_HEADERS;
}

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

function linkedInJobId(url: string) {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname)) return null;
    return parsed.pathname.match(/\/jobs\/view\/(\d+)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

function linkedInGuestUrls(url: string) {
  const jobId = linkedInJobId(url);
  if (!jobId) return [] as string[];
  return [
    `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`,
    `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}/`,
  ];
}

function rateLimitedMessage(isLinkedIn: boolean) {
  return isLinkedIn
    ? "LinkedIn rate-limited this server (HTTP 429). Wait a minute and try again, or use Upload Job Post with a PDF, DOCX, PNG, or JPG."
    : "The site rate-limited this server (HTTP 429). Wait a minute and try again, or upload the posting as a PDF, DOCX, PNG, or JPG.";
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

type SoftFetchResult =
  | { ok: true; html: string; status: number }
  | { ok: false; status: number; error?: unknown };

async function softFetchHtml(url: string): Promise<SoftFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: fetchHeadersFor(url),
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > MAX_HTML_BYTES) {
      throw new AppError("EXTRACT_FAILURE", "The job page is too large to extract.", 400);
    }
    const html = (await response.text()).slice(0, MAX_HTML_BYTES);
    return { ok: true, html, status: response.status };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, status: 408, error };
    }
    return { ok: false, status: 0, error };
  } finally {
    clearTimeout(timer);
  }
}

function linkedInResultFromHtml(sourceUrl: string, html: string): UrlExtractResult | null {
  const guestResult = cleanHtml(html);
  const linkedIn = parseLinkedInPosting(html);
  if ((linkedIn && (linkedIn.position || linkedIn.companyName || linkedIn.description)) || guestResult.textContent.length >= 40) {
    return {
      title: linkedIn?.position || guestResult.title || sourceUrl,
      textContent: guestResult.textContent,
      sourceUrl: normalizeUrl(sourceUrl) || sourceUrl,
      ...(linkedIn ? { linkedIn } : {}),
    };
  }
  return null;
}

async function launchBrowser() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: playwrightChromium } = await import("playwright-core");
    chromium.setGraphicsMode = false;
    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  const { chromium } = await import("playwright");
  return chromium.launch({ headless: true });
}

async function fetchHtmlWithPlaywright(url: string): Promise<{ html: string; title: string }> {
  try {
    const browser = await launchBrowser();
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
      if (response?.status() === 429) {
        throw new AppError("EXTRACT_FAILURE", rateLimitedMessage(/linkedin\.com/i.test(url)), 502);
      }
      await page.waitForTimeout(800);
      const html = await page.content();
      const title = await page.title();
      return { html, title };
    } finally {
      await browser.close();
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = error instanceof Error ? error.message : "";
    if (/Executable doesn't exist|browserType.launch|playwright install/i.test(message)) {
      throw new AppError(
        "EXTRACT_FAILURE",
        process.env.VERCEL
          ? "Could not start the page browser on the server. Try uploading the posting as a PDF, DOCX, PNG, or JPG instead."
          : "Playwright browsers are not installed. Run npx playwright install and try again.",
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

async function extractWithPlaywright(url: string): Promise<UrlExtractResult> {
  const { html, title } = await fetchHtmlWithPlaywright(url);
  const cleaned = cleanHtml(html);
  return {
    title: cleaned.title || title || url,
    textContent: cleaned.textContent,
    sourceUrl: normalizeUrl(url) || url,
  };
}

export async function extractFromUrl(url: string): Promise<UrlExtractResult> {
  const sourceUrl = validateHttpUrl(url);
  const isLinkedIn = Boolean(linkedInJobId(sourceUrl));
  const guestUrls = linkedInGuestUrls(sourceUrl);
  let sawRateLimit = false;

  // LinkedIn: guest HTML only on serverless (Playwright cold-start exceeds Vercel limits).
  for (const guestUrl of guestUrls) {
    const guestFetch = await softFetchHtml(guestUrl);
    if (guestFetch.ok) {
      const parsed = linkedInResultFromHtml(sourceUrl, guestFetch.html);
      if (parsed) return parsed;
    } else if (guestFetch.status === 429) {
      sawRateLimit = true;
    }
  }

  if (isLinkedIn && !IS_SERVERLESS) {
    for (const guestUrl of guestUrls) {
      try {
        const { html } = await fetchHtmlWithPlaywright(guestUrl);
        const parsed = linkedInResultFromHtml(sourceUrl, html);
        if (parsed) return parsed;
      } catch (error) {
        if (error instanceof AppError && /429|rate-limited/i.test(error.message)) sawRateLimit = true;
        else if (error instanceof AppError && error.code === "INVALID_URL") throw error;
      }
    }
  }

  if (isLinkedIn && IS_SERVERLESS) {
    throw new AppError(
      "EXTRACT_FAILURE",
      sawRateLimit
        ? rateLimitedMessage(true)
        : "Could not read this LinkedIn job from the hosted server. Use Upload Job Post with a PDF, DOCX, PNG, or JPG of the posting.",
      502
    );
  }

  const pageFetch = await softFetchHtml(sourceUrl);
  if (pageFetch.ok) {
    const cheerioResult = cleanHtml(pageFetch.html);
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

    try {
      const playwrightResult = await extractWithPlaywright(sourceUrl);
      if (playwrightResult.textContent.length >= 40) return playwrightResult;
    } catch (error) {
      if (error instanceof AppError && error.code === "INVALID_URL") throw error;
      if (error instanceof AppError && /429|rate-limited/i.test(error.message)) {
        throw error;
      }
      if (cheerioResult.textContent.length >= 40) {
        return {
          title: cheerioResult.title || sourceUrl,
          textContent: cheerioResult.textContent,
          sourceUrl: normalizeUrl(sourceUrl) || sourceUrl,
        };
      }
      throw error;
    }

    if (cheerioResult.textContent.length >= 40) {
      return {
        title: cheerioResult.title || sourceUrl,
        textContent: cheerioResult.textContent,
        sourceUrl: normalizeUrl(sourceUrl) || sourceUrl,
      };
    }
  } else if (pageFetch.status === 429) {
    throw new AppError("EXTRACT_FAILURE", rateLimitedMessage(false), 502);
  } else if (pageFetch.status === 404) {
    throw new AppError("INVALID_URL", "That job page could not be found (404).", 400);
  } else if (pageFetch.status > 0) {
    throw new AppError(
      "EXTRACT_FAILURE",
      `Could not fetch the job page (HTTP ${pageFetch.status}). Try uploading a PDF, DOCX, PNG, or JPG instead.`,
      502
    );
  } else {
    throw new AppError(
      "EXTRACT_FAILURE",
      "Network failure while fetching the job URL. Check the link and try again.",
      502
    );
  }

  throw new AppError(
    "EXTRACT_FAILURE",
    "Could not extract readable text from this page after Cheerio and Playwright. Try uploading a PDF instead.",
    502
  );
}

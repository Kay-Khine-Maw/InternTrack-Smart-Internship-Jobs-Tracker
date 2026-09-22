import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  hydrateFromSourceText,
  normalizeExtractedData,
  sanitizeApplicationUrl,
  splitApplicationContacts,
  toReviewDraft,
} from "../lib/extract-mapper";
import { TRANSLATABLE_FIELDS, parseTranslations } from "../lib/translations";

function section(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

const review = readFileSync(join(__dirname, "../app/add-internship/page.tsx"), "utf8");
const detail = readFileSync(join(__dirname, "../app/internships/[id]/page.tsx"), "utf8");
const bar = readFileSync(join(__dirname, "../components/internships/FieldTranslateBar.tsx"), "utf8");
const extractor = readFileSync(join(__dirname, "../lib/ai/internshipExtractor.ts"), "utf8");
const translateRoute = readFileSync(join(__dirname, "../app/api/translate/route.ts"), "utf8");

section("1. Company field has no translate control", () => {
  assert.equal(review.includes('translateBar("companyName")'), false);
  assert.equal(review.includes('toolbar={translateBar("companyName")}'), false);
  assert.equal(detail.includes('["Company", "companyName"'), false);
  assert.match(bar, /\/google-translate\.png/);
  assert.match(bar, /aria-label="Translate"/);
  assert.doesNotMatch(bar, /TranslateIcon spinning=\{busy\} \/>\s*Translate/);
});

section("2. Email-like applicationUrl is stripped to null (moved to hrEmail)", () => {
  assert.equal(sanitizeApplicationUrl("jobs@company.com"), null);
  assert.equal(sanitizeApplicationUrl("mailto:hr@company.com"), null);
  assert.equal(sanitizeApplicationUrl("081-234-5678"), null);
  assert.equal(sanitizeApplicationUrl("@acmejobs"), null);
  const fromEmail = normalizeExtractedData({
    companyName: "Acme",
    position: "Intern",
    applicationUrl: "hr@company.com",
  });
  assert.equal(fromEmail.applicationUrl, null);
  assert.equal(fromEmail.hrEmail, "hr@company.com");
  const split = splitApplicationContacts("interns@acme.com");
  assert.equal(split.applicationUrl, null);
  assert.equal(split.hrEmail, "interns@acme.com");
});

section("3. https application URL is kept", () => {
  const url = "https://company.com/jobs/123";
  assert.equal(sanitizeApplicationUrl(url), url);
  const data = normalizeExtractedData({ applicationUrl: url, hrEmail: "hr@company.com" });
  assert.equal(data.applicationUrl, url);
  assert.equal(data.hrEmail, "hr@company.com");
});

section("4. Location and description aliases map into the review draft", () => {
  const fromAliases = normalizeExtractedData({
    companyName: "บริษัท ABC จำกัด",
    position: "Software Engineer Intern",
    place: "กรุงเทพฯ",
    jobDescription: "ฝึกงานด้านซอฟต์แวร์กับทีมพัฒนา",
  });
  assert.equal(fromAliases.location, "กรุงเทพฯ");
  assert.equal(fromAliases.description, "ฝึกงานด้านซอฟต์แวร์กับทีมพัฒนา");
  const fromNested = normalizeExtractedData({
    workplace: { city: "Bangkok" },
    description: ["Build intern tools.", "Work with mentors."],
  });
  assert.equal(fromNested.location, "Bangkok");
  assert.match(fromNested.description ?? "", /Build intern tools/);
  const hydrated = hydrateFromSourceText(
    "Company: SCB\nPosition: Intern\nสถานที่: กรุงเทพฯ\n\nThis internship supports the digital banking product team with weekly mentoring.",
    { ...fromAliases, location: null, description: null }
  );
  assert.equal(hydrated.location, "กรุงเทพฯ");
  assert.match(hydrated.description ?? "", /internship supports/);
  const draft = toReviewDraft(fromAliases);
  assert.equal(draft.location, "กรุงเทพฯ");
  assert.equal(draft.description, "ฝึกงานด้านซอฟต์แวร์กับทีมพัฒนา");
});

section("5. Deadline empty copy is exact and optional", () => {
  assert.match(review, /Deadline not found\. Add it manually\./);
  assert.match(detail, /Deadline not found\. Add it manually\./);
  assert.doesNotMatch(review, /placeholder="Deadline not found/);
  assert.match(review, /type="date"/);
  const draft = toReviewDraft({ companyName: "Acme", position: "Intern", deadline: null });
  assert.equal(draft.deadline, "");
});

section("6. Extract preserves language; translate API is optional English", () => {
  assert.match(extractor, /Extract information exactly as written in the job post\./);
  assert.match(extractor, /Preserve the original language\./);
  assert.match(extractor, /Do not translate automatically\./);
  assert.match(extractor, /Return the extracted text in the same language as the source\./);
  assert.match(extractor, /Do not leave location null/);
  assert.match(extractor, /Do not leave description null/);
  assert.match(translateRoute, /There is no text to translate/);
  assert.match(review, /target:\s*"en"/);
  assert.match(bar, /Translate/);
  assert.match(bar, />\s*Original\s*</);
  assert.match(bar, />\s*English\s*</);
  assert.doesNotMatch(bar, /Original Language/);
  assert.doesNotMatch(bar, /English Translation/);
  assert.match(review, /toolbar=\{translateBar\("position"\)\}/);
  assert.match(review, /toolbar=\{translateBar\("description"\)\}/);
  assert.match(review, /toolbar=\{translateBar\("requirements"\)\}/);
  assert.match(review, /toolbar=\{translateBar\("notes"\)\}/);
});

console.log("\nAll extract/translate guard scenarios passed.");

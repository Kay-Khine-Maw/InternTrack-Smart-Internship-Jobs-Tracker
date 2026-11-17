import assert from "node:assert/strict";
import {
  findDuplicateRecord,
  isEmptyExtractedValue,
  toDuplicateInfo,
} from "../lib/duplicate-match";
import { normalizeExtractedData, toReviewDraft } from "../lib/extract-mapper";
import { normalizeUrl } from "../lib/utils";

const googleUrl = "https://careers.google.com/jobs/results/software-engineering-intern";
const googleUrlTracked = `${googleUrl}/?utm_source=linkedin&utm_campaign=fall`;
const agodaUrl = "https://careers.agoda.com/jobs/internship-2026";

const google = {
  id: "int-google",
  companyName: "Google",
  position: "Software Engineering Intern",
  sourceUrl: googleUrl,
  applicationUrl: googleUrl,
};

const agoda = {
  id: "int-agoda",
  companyName: "Agoda",
  position: "Backend Intern",
  sourceUrl: agodaUrl,
  applicationUrl: agodaUrl,
};

function section(name: string, fn: () => void) {
  fn();
  console.log(`PASS ${name}`);
}

section("1. Same Google URL twice → modal with Google", () => {
  const match = findDuplicateRecord([google], { sourceUrl: googleUrlTracked }, { urlOnly: true });
  assert.ok(match);
  const info = toDuplicateInfo(match);
  assert.equal(info.companyName, "Google");
  assert.equal(info.id, "int-google");
  assert.equal(normalizeUrl(googleUrlTracked), normalizeUrl(googleUrl));
});

section("2. Agoda URL after Google exists → Agoda, not Google", () => {
  const extractMatch = findDuplicateRecord([google], { sourceUrl: agodaUrl }, { urlOnly: true });
  assert.equal(extractMatch, undefined, "new Agoda URL must not match Google on extract");

  const afterAgodaSaved = findDuplicateRecord([google, agoda], { sourceUrl: agodaUrl }, { urlOnly: true });
  assert.ok(afterAgodaSaved);
  assert.equal(toDuplicateInfo(afterAgodaSaved).companyName, "Agoda");
  assert.notEqual(toDuplicateInfo(afterAgodaSaved).companyName, "Google");
});

section("3. New URL → no modal", () => {
  const match = findDuplicateRecord([google, agoda], {
    sourceUrl: "https://jobs.ashbyhq.com/new-company/intern",
  });
  assert.equal(match, undefined);
});

section("empty-to-empty company+position never matches", () => {
  const blank = { id: "blank", companyName: "", position: "", sourceUrl: null, applicationUrl: null };
  const match = findDuplicateRecord([blank, google], { companyName: "", position: "" });
  assert.equal(match, undefined);
});

section("4. Extract without deadline → empty, not a fake date", () => {
  const data = normalizeExtractedData({
    companyName: "Acme",
    position: "Intern",
    deadline: null,
    requiredDocuments: ["Resume"],
  });
  assert.equal(data.deadline, null);
  assert.equal(isEmptyExtractedValue(data.deadline), true);
  const draft = toReviewDraft(data);
  assert.equal(draft.deadline, "");
});

section("5. Extract without docs → empty list, placeholder only in UI", () => {
  const data = normalizeExtractedData({
    companyName: "Acme",
    position: "Intern",
    requiredDocuments: [],
    skills: [],
  });
  assert.equal(isEmptyExtractedValue(data.requiredDocuments), true);
  const draft = toReviewDraft(data);
  assert.equal(draft.documents.length, 0);
  assert.notEqual(draft.companyName, "Information not found. Add it manually.");
});

section("title match only when both sides have company and position", () => {
  const match = findDuplicateRecord([google], {
    sourceUrl: "https://example.com/new",
    companyName: "Google",
    position: "Software Engineering Intern",
  });
  assert.equal(match?.id, "int-google");

  const partial = findDuplicateRecord([google], {
    sourceUrl: "https://example.com/new",
    companyName: "Google",
    position: "",
  });
  assert.equal(partial, undefined);
});

console.log("\nAll duplicate + empty-field scenarios passed.");

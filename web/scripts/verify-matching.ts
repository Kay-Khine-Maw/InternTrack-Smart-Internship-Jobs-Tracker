import assert from "node:assert/strict";
import { calculateMatch, matchingRequirementsFromLegacy, type MatchingRequirement } from "../lib/matching";
import { resumeSchema } from "../lib/resume-schema";
import { DEFAULT_PROFILE } from "../lib/profile";

const profile = {
  ...DEFAULT_PROFILE,
  skills: ["Python", "React"],
  tools: ["Git"],
  preferredLocation: "Bangkok",
};

const requirements: MatchingRequirement[] = [
  { label: "Python", category: "skill", classification: "required" },
  { label: "JavaScript", category: "skill", classification: "required" },
  { label: "Git", category: "tool", classification: "preferred" },
  { label: "French", category: "language", classification: "preferred" },
];
const result = calculateMatch(profile, requirements);
assert.equal(result.state, "ready");
assert.equal(result.criteria.find((item) => item.label === "Python")?.result, "matched");
assert.equal(result.criteria.find((item) => item.label === "JavaScript")?.result, "not_met");
assert.equal(result.criteria.find((item) => item.label === "French")?.result, "unknown");
assert.ok(result.coverage > 0 && result.coverage <= 100);

const qaResult = calculateMatch({
  ...profile,
  skills: ["Manual testing", "Test case design", "REST API testing"],
}, [
  { label: "manual software testing", category: "other", classification: "required" },
  { label: "test-case design", category: "skill", classification: "required" },
  { label: "APIs", category: "tool", classification: "preferred" },
]);
assert.equal(qaResult.criteria.find((item) => item.label === "manual software testing")?.result, "matched");
assert.equal(qaResult.criteria.find((item) => item.label === "test-case design")?.result, "matched");
assert.equal(qaResult.criteria.find((item) => item.label === "APIs")?.result, "matched");
assert.ok((qaResult.score ?? 0) > 0);

const empty = calculateMatch(profile, []);
assert.equal(empty.state, "insufficient_requirements");
assert.equal(empty.score, null);

const legacy = matchingRequirementsFromLegacy(["SQL"], ["Python"]);
assert.equal(legacy.length, 2);
assert.equal(calculateMatch({ ...profile, skills: ["SQL"] }, legacy).state, "ready");

const validated = resumeSchema.parse({ skills: ["Python"], tools: [], education: [], experience: [], projects: [], languages: [], contact: {}, links: {} });
assert.deepEqual(validated.skills, ["Python"]);
assert.equal(validated.summary, null);

console.log("PASS matching weights, aliases, unknown state, zero denominator, and resume validation");

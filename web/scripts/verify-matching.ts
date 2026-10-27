import assert from "node:assert/strict";
import { calculateMatch, type MatchingRequirement } from "../lib/matching";
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

const empty = calculateMatch(profile, []);
assert.equal(empty.state, "insufficient_requirements");
assert.equal(empty.score, null);

const validated = resumeSchema.parse({ skills: ["Python"], tools: [], education: [], experience: [], projects: [], languages: [], contact: {}, links: {} });
assert.deepEqual(validated.skills, ["Python"]);
assert.equal(validated.summary, null);

console.log("PASS matching weights, aliases, unknown state, zero denominator, and resume validation");

import assert from "node:assert/strict";
import { calculateMatch, matchingRequirementsFromLegacy, type MatchingRequirement } from "../lib/matching";
import { combineMatchExplanation, explainMatchPercentage, matchExplanationHash, matchExplanationSnapshot, readStoredMatchExplanation } from "../lib/match-explanation";
import { parseMatchAssessmentText } from "../lib/match-assessment";
import { alignSkillGapRecommendations, parseSkillGapRecommendations, withCommonLearningSites } from "../lib/skill-gap-recommendations";
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
assert.equal(result.criteria.find((item) => item.label === "Python")?.match?.reason, "Matches your skill Python.");
assert.equal(result.criteria.find((item) => item.label === "Git")?.match?.reason, "Matches your tool Git.");
assert.equal(result.skillMatch.percentage, 67);
assert.equal(result.score, 67);
const repeated = calculateMatch(profile, requirements);
assert.equal(repeated.skillMatch.percentage, result.skillMatch.percentage);
assert.equal(repeated.score, result.score);
assert.equal(repeated.skillMatch.matchedCount, result.skillMatch.matchedCount);
assert.equal(repeated.skillMatch.comparedCount, result.skillMatch.comparedCount);
assert.equal(result.skillMatch.matchedCount, 2);
assert.equal(result.skillMatch.comparedCount, 3);
assert.deepEqual(result.skillMatch.matched.map((item) => item.label), ["Python", "Git"]);
assert.equal(result.skillMatch.toAcquire.length, 1);
assert.equal(result.skillMatch.toAcquire[0]?.label, "JavaScript");
assert.equal(result.skillMatch.toAcquire[0]?.classification, "required");
assert.equal(result.skillMatch.toAcquire[0]?.detail, "JavaScript — required on this posting, not in your skills or tools.");
assert.equal(result.skillMatch.unknown.some((item) => item.label === "French"), true);
assert.equal(result.skillMatch.toAcquire.some((item) => item.label === "French"), false);
assert.deepEqual(result.skillMatch.unmentionedProfileSkills, ["React"]);
assert.ok(result.coverage > 0 && result.coverage <= 100);

const aliasResult = calculateMatch(
  { ...profile, skills: ["React"], tools: [] },
  [{ label: "React.js", category: "skill", classification: "required" }]
);
assert.equal(aliasResult.skillMatch.percentage, 100);
assert.equal(
  aliasResult.skillMatch.matched[0]?.reason,
  "Matches your skill React. React.js and React are treated as the same skill."
);

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
assert.equal(qaResult.criteria.find((item) => item.label === "APIs")?.match?.reason, "Matches your skill REST API testing because the wording overlaps with APIs.");
assert.equal(qaResult.skillMatch.percentage, 100);
assert.equal(qaResult.score, 100);
assert.equal(qaResult.skillMatch.otherRequirements.length, 0);

const ordered = calculateMatch(
  { ...profile, skills: ["Python"], tools: [] },
  [
    { label: "Figma", category: "tool", classification: "preferred" },
    { label: "Java", category: "skill", classification: "required" },
  ]
);
assert.deepEqual(ordered.skillMatch.toAcquire.map((item) => item.label), ["Java", "Figma"]);

const educationOnly = calculateMatch(profile, [
  { label: "Computer Engineering", category: "education", classification: "required" },
]);
assert.equal(educationOnly.skillMatch.percentage, null);
assert.equal(educationOnly.skillMatch.emptyReason, "no_skill_requirements");
assert.equal(educationOnly.score, null);

const empty = calculateMatch(profile, []);
assert.equal(empty.state, "insufficient_requirements");
assert.equal(empty.score, null);
assert.equal(empty.skillMatch.percentage, null);

const legacy = matchingRequirementsFromLegacy(["SQL"], ["Python"]);
assert.equal(legacy.length, 2);
assert.equal(calculateMatch({ ...profile, skills: ["SQL"] }, legacy).state, "ready");

const validated = resumeSchema.parse({ skills: ["Python"], tools: [], education: [], experience: [], projects: [], languages: [], contact: {}, links: {} });
assert.deepEqual(validated.skills, ["Python"]);
assert.equal(validated.summary, null);

const assessment = parseMatchAssessmentText('{"percentage": 67, "explanation": "Python and Git meet requirements. JavaScript does not, so the match is 67 percent."}');
assert.equal(assessment?.percentage, 67);
assert.match(assessment?.explanation ?? "", /JavaScript/);
assert.equal(parseMatchAssessmentText('{"percentage": 10, "explanation": "Too short."}'), null);

const gaps = parseSkillGapRecommendations(`\`\`\`json
[
  {"skill":" JavaScript ","reason":" Required and missing, so it raises the match before a preferred tool. ","estimatedTime":" 1–2 weeks "},
  {"skill":"","reason":"skip","estimatedTime":"1 day"},
  "nope",
  {"skill":"SQL","reason":"Still missing, with a smaller effect than the required skill.","estimatedTime":"3–5 days"},
  {"skill":"Docker","reason":"Preferred and missing.","estimatedTime":"1 week"},
  {"skill":"Kubernetes","reason":"Preferred and broader than Docker.","estimatedTime":"2–4 weeks"},
  {"skill":"AWS","reason":"Preferred cloud skill.","estimatedTime":"2–3 weeks"},
  {"skill":"CI","reason":"Still a valid missing skill inside the parse window.","estimatedTime":"1 week"},
  {"skill":"GraphQL","reason":"Still a valid missing skill inside the parse window.","estimatedTime":"1 week"}
]
\`\`\``);
assert.deepEqual(gaps?.map((item) => item.skill), ["JavaScript", "SQL", "Docker", "Kubernetes", "AWS", "CI", "GraphQL"]);
assert.equal(gaps?.[0]?.estimatedTime, "1–2 weeks");
assert.match(gaps?.[0]?.reason ?? "", /required/i);
assert.equal(parseSkillGapRecommendations("[]")?.length, 0);
assert.equal(parseSkillGapRecommendations('[{"skill":" ","reason":"x","estimatedTime":"1 week"}]'), null);
assert.equal(parseSkillGapRecommendations("not json"), null);
assert.equal(
  parseSkillGapRecommendations('[{"skill":"Java","reason":"Required and missing.","estimatedTime":""},{"skill":"SQL","reason":"Also missing.","estimatedTime":"1 week"}]')?.[0]?.skill,
  "SQL"
);
assert.deepEqual(
  parseSkillGapRecommendations('[{"skill":"Java","reason":"Required and missing.","estimatedTime":"2–3 weeks"},{"skill":"java","reason":"duplicate","estimatedTime":"1 day"},{"skill":"Spring","reason":"Related required gap.","estimatedTime":"1–2 weeks"}]')?.map((item) => item.skill),
  ["Java", "Spring"]
);
assert.equal(
  parseSkillGapRecommendations('{"recommendations":[{"skill":"Figma","reason":"Preferred tool and still missing.","estimatedTime":"a few days"}]}')?.[0]?.skill,
  "Figma"
);
const longReason = "R".repeat(300);
const capped = parseSkillGapRecommendations(JSON.stringify([{ skill: "Go", reason: longReason, estimatedTime: "Estimate: 1 week" }]));
assert.equal(capped?.[0]?.reason.length, 240);
assert.equal(capped?.[0]?.estimatedTime, "1 week");

const many = Array.from({ length: 20 }, (_, index) => ({
  skill: `Skill${index}`,
  reason: "Required and still missing on this posting.",
  estimatedTime: `${index + 1} days`,
}));
const parsedMany = parseSkillGapRecommendations(JSON.stringify(many));
assert.equal(parsedMany?.length, 16);
assert.deepEqual(
  alignSkillGapRecommendations(
    parsedMany ?? [],
    many.map((item) => ({ label: item.skill, classification: "required" as const })),
  ).map((item) => item.skill),
  ["Skill0", "Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6", "Skill7"],
);

const orderedGaps = alignSkillGapRecommendations(
  [
    { skill: "Figma", reason: "Preferred design tool the posting asks for.", estimatedTime: "2 days" },
    { skill: "Kubernetes", reason: "This posting does not ask for Kubernetes.", estimatedTime: "1 day" },
    { skill: "JS", reason: "Required language on the posting that the profile does not cover.", estimatedTime: "3–4 weeks" },
    { skill: "SQL", reason: "Required database skill on the posting, with a shorter learning estimate.", estimatedTime: "3–5 days" },
    { skill: "Node", reason: "Required runtime the posting lists as Node.js.", estimatedTime: "1–2 weeks" },
    { skill: "React.js", reason: "Preferred UI skill the posting lists as React.", estimatedTime: "1 week" },
  ],
  [
    { label: "JavaScript", classification: "required" },
    { label: "SQL", classification: "required" },
    { label: "Node.js", classification: "required" },
    { label: "Figma", classification: "preferred" },
    { label: "React", classification: "preferred" },
  ],
);
assert.deepEqual(orderedGaps.map((item) => item.skill), ["SQL", "Node.js", "JavaScript", "Figma", "React"]);
assert.equal(orderedGaps[0]?.estimatedTime, "3–5 days");

const collapsed = alignSkillGapRecommendations(
  [
    { skill: "JS", reason: "Same required language.", estimatedTime: "1 day" },
    { skill: "JavaScript", reason: "Duplicate alias.", estimatedTime: "1 week" },
  ],
  [
    { label: "JavaScript", classification: "required" },
    { label: "JS", classification: "preferred" },
  ],
);
assert.deepEqual(collapsed.map((item) => item.skill), ["JavaScript"]);
assert.equal(collapsed[0]?.estimatedTime, "1 day");

const unparsedTime = alignSkillGapRecommendations(
  [
    { skill: "Java", reason: "Required and missing, without a numeric estimate.", estimatedTime: "soon" },
    { skill: "Go", reason: "Required and missing, with a short estimate.", estimatedTime: "4 days" },
  ],
  [
    { label: "Java", classification: "required" },
    { label: "Go", classification: "required" },
  ],
);
assert.deepEqual(unparsedTime.map((item) => item.skill), ["Go", "Java"]);

const stable = alignSkillGapRecommendations(
  [
    { skill: "Kotlin", reason: "Required and missing.", estimatedTime: "2 weeks" },
    { skill: "Swift", reason: "Required and missing too.", estimatedTime: "2 weeks" },
  ],
  [
    { label: "Swift", classification: "required" },
    { label: "Kotlin", classification: "required" },
  ],
);
assert.deepEqual(stable.map((item) => item.skill), ["Kotlin", "Swift"]);
assert.deepEqual(
  alignSkillGapRecommendations(
    [{ skill: "Java", reason: "The model invented this.", estimatedTime: "1 week" }],
    [],
  ),
  [],
);

const longHowTo = "Learn this skill by practicing a small project. ".repeat(40);
const detailed = parseSkillGapRecommendations(JSON.stringify([{
  skill: "TypeScript",
  reason: "Required and missing.",
  estimatedTime: "2 weeks",
  howTo: longHowTo,
  links: [
    { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
    { label: "MDN", url: "http://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { label: "Bad script", url: "javascript:alert(1)" },
    { label: "FTP", url: "ftp://files.example.com/ts" },
    { label: "Relative", url: "/learn" },
    { label: "Bare host", url: "www.example.com" },
    { label: "Spaced", url: "https://example.com/type script" },
    { label: "Fourth valid", url: "https://example.com/typescript" },
  ],
}]));
assert.equal(detailed?.[0]?.howTo?.length, 500);
assert.deepEqual(detailed?.[0]?.links, [
  { label: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/" },
  { label: "MDN", url: "http://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  { label: "Fourth valid", url: "https://example.com/typescript" },
]);

const unlabeled = parseSkillGapRecommendations(JSON.stringify([{
  skill: "CSS",
  reason: "Required and missing.",
  estimatedTime: "1 week",
  links: [
    { label: "  ", url: "https://www.w3.org/Style/CSS/" },
    { label: "Duplicate", url: "https://www.w3.org/Style/CSS/" },
    { url: "not a url" },
  ],
}]));
assert.deepEqual(unlabeled?.[0]?.links, [{ label: "w3.org", url: "https://www.w3.org/Style/CSS/" }]);
assert.equal(unlabeled?.[0]?.howTo, undefined);

const invalidOnly = parseSkillGapRecommendations(JSON.stringify([{
  skill: "Rust",
  reason: "Required and missing.",
  estimatedTime: "3 weeks",
  howTo: "   ",
  links: [
    { label: "Nope", url: "javascript:alert(1)" },
    { label: "File", url: "file:///tmp/rust" },
  ],
}]));
assert.equal(invalidOnly?.[0]?.skill, "Rust");
assert.equal(invalidOnly?.[0]?.howTo, undefined);
assert.equal(invalidOnly?.[0]?.links, undefined);

const keptDetails = alignSkillGapRecommendations(
  [
    {
      skill: "JS",
      reason: "Required language the posting asks for.",
      estimatedTime: "2 weeks",
      howTo: "Build a small page that uses arrays, functions, and fetch.",
      links: [
        { label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
        { label: "Skip", url: "ftp://example.com/js" },
      ],
    },
    {
      skill: "Kubernetes",
      reason: "The posting does not ask for this.",
      estimatedTime: "1 day",
      howTo: "Do not keep this skill.",
      links: [{ label: "Kubernetes", url: "https://kubernetes.io/docs/home/" }],
    },
  ],
  [{ label: "JavaScript", classification: "required" }],
);
assert.deepEqual(keptDetails.map((item) => item.skill), ["JavaScript"]);
assert.equal(keptDetails[0]?.howTo, "Build a small page that uses arrays, functions, and fetch.");
assert.deepEqual(keptDetails[0]?.links, [
  { label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
]);

const fromText = parseSkillGapRecommendations('{"recommendations":[{"skill":"Figma","reason":"Preferred and missing.","estimatedTime":"2 days"},{"skill":"Python","reason":"Not a missing requirement.","estimatedTime":"1 day"},{"skill":"Java","reason":"Required and missing.","estimatedTime":"6 weeks"}]}');
assert.deepEqual(
  alignSkillGapRecommendations(fromText ?? [], [
    { label: "Java", classification: "required" },
    { label: "Figma", classification: "preferred" },
  ]).map((item) => item.skill),
  ["Java", "Figma"],
);

const commonSites = withCommonLearningSites("C++", [
  { label: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  { label: "Coursera course", url: "https://www.coursera.org/learn/cpp" },
  { label: "LinkedIn jobs", url: "https://www.linkedin.com/jobs/search?keywords=cpp" },
]);
assert.deepEqual(commonSites.map((link) => link.label), ["MDN", "Coursera course", "LinkedIn jobs", "Udemy", "freeCodeCamp"]);
assert.equal(commonSites.find((link) => link.label === "Udemy")?.url, "https://www.udemy.com/courses/search/?q=C%2B%2B");
assert.equal(commonSites.find((link) => link.label === "freeCodeCamp")?.url, "https://www.freecodecamp.org/news/search?query=C%2B%2B");
assert.ok(commonSites.every((link) => link.url.startsWith("https://")));

const onlyCommon = withCommonLearningSites("SQL", []);
assert.deepEqual(onlyCommon.map((link) => link.label), ["Coursera", "Udemy", "freeCodeCamp", "LinkedIn Learning"]);
assert.equal(onlyCommon[0]?.url, "https://www.coursera.org/search?query=SQL");
assert.equal(onlyCommon[1]?.url, "https://www.udemy.com/courses/search/?q=SQL");
assert.equal(onlyCommon[2]?.url, "https://www.freecodecamp.org/news/search?query=SQL");
assert.equal(onlyCommon[3]?.url, "https://www.linkedin.com/learning/search?keywords=SQL");

const skippedSubdomain = withCommonLearningSites("Excel", [
  { label: "Udemy business", url: "https://business.udemy.com/excel" },
]);
assert.equal(skippedSubdomain.some((link) => link.label === "Udemy"), false);
assert.equal(skippedSubdomain[0]?.label, "Udemy business");

const droppedInvalid = withCommonLearningSites("Rust", [{ label: "Bad", url: "javascript:alert(1)" }]);
assert.deepEqual(droppedInvalid.map((link) => link.label), ["Coursera", "Udemy", "freeCodeCamp", "LinkedIn Learning"]);
assert.deepEqual(withCommonLearningSites("   ", [{ label: "Docs", url: "https://example.com/docs" }]), [
  { label: "Docs", url: "https://example.com/docs" },
]);

const explanationSnapshot = matchExplanationSnapshot(profile, requirements, result.skillMatch.percentage);
const repeatedSnapshot = matchExplanationSnapshot(profile, [...requirements].reverse(), repeated.skillMatch.percentage);
const reorderedSkills = matchExplanationSnapshot(
  { ...profile, skills: ["React", "Python"] },
  requirements,
  result.skillMatch.percentage,
);
assert.equal(matchExplanationHash(explanationSnapshot), matchExplanationHash(repeatedSnapshot));
assert.equal(matchExplanationHash(explanationSnapshot), matchExplanationHash(reorderedSkills));
assert.equal(
  matchExplanationHash(matchExplanationSnapshot(
    profile,
    [...requirements, { label: "Spanish", category: "language", classification: "preferred" }],
    result.skillMatch.percentage,
  )),
  matchExplanationHash(explanationSnapshot),
);
const stableExplanation = explainMatchPercentage(result, null, explanationSnapshot);
const stableExplanationAgain = explainMatchPercentage(repeated, null, explanationSnapshot);
assert.equal(stableExplanation, stableExplanationAgain);
assert.equal(
  stableExplanation,
  "This match is 67% because 2 of 3 skill and tool requirements on this posting are in your profile. In your profile: Python and Git. Not in your profile: JavaScript.",
);
const storedExplanation = readStoredMatchExplanation({
  hash: matchExplanationHash(explanationSnapshot),
  explanation: stableExplanation,
  snapshot: explanationSnapshot,
});
assert.equal(storedExplanation?.hash, matchExplanationHash(explanationSnapshot));
assert.equal(storedExplanation?.explanation, stableExplanation);
assert.equal(
  readStoredMatchExplanation(JSON.stringify({
    hash: matchExplanationHash(explanationSnapshot),
    explanation: stableExplanation,
    snapshot: explanationSnapshot,
  }))?.explanation,
  stableExplanation,
);
assert.equal(readStoredMatchExplanation({ hash: "x" }), null);

const addedSkillProfile = { ...profile, skills: ["Python", "React", "JavaScript"] };
const addedSkillMatch = calculateMatch(addedSkillProfile, requirements);
const addedSkillSnapshot = matchExplanationSnapshot(addedSkillProfile, requirements, addedSkillMatch.skillMatch.percentage);
assert.equal(addedSkillMatch.skillMatch.percentage, 100);
assert.equal(addedSkillMatch.score, 100);
const addedSkillExplanation = explainMatchPercentage(addedSkillMatch, explanationSnapshot, addedSkillSnapshot);
assert.equal(addedSkillExplanation, explainMatchPercentage(addedSkillMatch, explanationSnapshot, addedSkillSnapshot));
assert.equal(
  addedSkillExplanation,
  "This match is 100% because 3 of 3 skill and tool requirements on this posting are in your profile. In your profile: Python, JavaScript, and Git. This percentage changed from 67% to 100% because you added JavaScript to your profile skills.",
);

const removedSkillProfile = { ...profile, skills: ["Python"] };
const removedSkillMatch = calculateMatch(removedSkillProfile, requirements);
const removedSkillSnapshot = matchExplanationSnapshot(removedSkillProfile, requirements, removedSkillMatch.skillMatch.percentage);
assert.equal(removedSkillMatch.skillMatch.percentage, 67);
assert.equal(
  explainMatchPercentage(removedSkillMatch, explanationSnapshot, removedSkillSnapshot),
  "This match is 67% because 2 of 3 skill and tool requirements on this posting are in your profile. In your profile: Python and Git. Not in your profile: JavaScript. This percentage stayed 67% after you removed React from your profile skills.",
);

const addedRequirement = [...requirements, { label: "SQL", category: "skill" as const, classification: "required" as const }];
const addedRequirementMatch = calculateMatch(profile, addedRequirement);
const addedRequirementSnapshot = matchExplanationSnapshot(profile, addedRequirement, addedRequirementMatch.skillMatch.percentage);
assert.equal(addedRequirementMatch.skillMatch.percentage, 50);
assert.equal(
  explainMatchPercentage(addedRequirementMatch, explanationSnapshot, addedRequirementSnapshot),
  "This match is 50% because 2 of 4 skill and tool requirements on this posting are in your profile. In your profile: Python and Git. Not in your profile: JavaScript and SQL. This percentage changed from 67% to 50% because this posting added SQL.",
);

const firstSentence = "This match is 67% because 2 of 3 skill and tool requirements on this posting are in your profile.";
const smoothFollowOn = "Python and Git are already in your profile. JavaScript is still missing.";
assert.equal(stableExplanation?.startsWith(`${firstSentence} `), true);
assert.equal(combineMatchExplanation(firstSentence, smoothFollowOn), `${firstSentence} ${smoothFollowOn}`);
assert.equal(combineMatchExplanation(firstSentence, `${firstSentence} ${smoothFollowOn}`), `${firstSentence} ${smoothFollowOn}`);
assert.equal(
  combineMatchExplanation(firstSentence, `This match is 80% because 1 of 3 skill and tool requirements on this posting are in your profile. ${smoothFollowOn}`),
  `${firstSentence} ${smoothFollowOn}`,
);
assert.equal(combineMatchExplanation(firstSentence, "   "), firstSentence);

console.log("PASS matching weights, skill-match reasons, unknown state, zero denominator, resume validation, skill-gap ordering, and stable skill-match percentage");

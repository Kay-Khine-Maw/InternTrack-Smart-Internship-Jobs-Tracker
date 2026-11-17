# InternTrack AI Logic and Evidence

Branch: `main`. Commands were run from `web/` on 17 November 2026 and are copied in [measurement-results.md](../test/measurement-results.md).

`CLAUDE.md` and specification F3 allow an OpenAI text-extraction fallback when `GEMINI_API_KEY` is absent and `OPENAI_API_KEY` is set; `web/lib/ai/internshipExtractor.ts` implements that path. Translation, match-explanation smoothing, and skill-gap recommendations call Gemini only.

`web/lib/server/profileMatchScore.ts` contains a Gemini prompt that returns a percentage. The match route does not import that file. The percentage shown in the panel is not taken from it.

## 1. Structured extraction

### Where

- `web/lib/ai/internshipExtractor.ts`
- `web/app/api/extract/route.ts`
- Image input uses `extractWithGeminiVision` when `GEMINI_API_KEY` is set.
- Text input uses Gemini when `GEMINI_API_KEY` is set. If that key is missing and `OPENAI_API_KEY` is set, `extractInternshipFromText` calls `extractWithOpenAI`.

### How

The extractor sends source text to the provider, parses a structured response, and the review screen shows a draft. The specification requires an explicit Save before an internship exists. Missing strings are normalized to null and missing lists to empty arrays in the F3 acceptance text. This file does not claim a live provider call was made on 17 November 2026.

### Prove

`npm run test:extract` exited 0. `web/scripts/verify-extract.ts` is empty, so the exit code does not prove extraction, missing fields, or provider failure.

The five response records say extraction was mostly trusted and that the person still checked the original. That is in [interview-transcripts.md](../discover/interview-transcripts.md). It is not an accuracy score.

### Measure

Extraction accuracy, false positives, and false negatives: not measured.

## 2. Translation

### Where

- `web/lib/ai/translateText.ts`
- `web/app/api/translate/route.ts`
- `web/components/internships/FieldTranslateBar.tsx`

### How

`translateTextToEnglish` requires `GEMINI_API_KEY`. It does not read `OPENAI_API_KEY`. The prompt asks for English JSON (`translatedText`) and says already-English text should stay unchanged. The original field is a separate value in the product flow described by F11. No translation fixture was executed on 17 November 2026.

### Prove

There is no translation assertion script in `web/package.json`. U02's response says English details were easier and some words sounded unnatural. That is one interview answer, not a quality score.

### Measure

Translation quality: not measured.

## 3. Match explanation smoothing

### Where

- Percentage: `skillMatchSummary` in `web/lib/matching.ts`. For skill and tool rows that are matched or not met, `percentage` is `Math.round((matchedCriteria.length / compared.length) * 100)`. If none are compared, the percentage is null. `calculateMatch` copies that percentage into `score`.
- First sentence: `matchExplanationSentences` in `web/lib/match-explanation.ts`. It is built in application code: `This match is ${percentage}% because ${matchedCount} of ${comparedCount} skill and tool ...`
- Later sentences: `smoothMatchFollowOn` in `web/lib/server/smoothMatchExplanation.ts`.
- Route: `web/app/api/internships/[id]/match/route.ts`.
- Panel: `web/components/internships/MatchPanel.tsx`, heading "Why this percentage".

### How

Gemini does not replace the percentage. The smoother prompt says not to change the percentage, not to rewrite the first sentence, and not to predict hiring. `combineMatchExplanation` keeps the deterministic first sentence and appends the model text.

The route stores a successful rewrite on the internship as `matchExplanationState` (hash, explanation, snapshot, `smoothed: true`). The same hash and a stored explanation that starts with the current first sentence is reused. An in-memory `wordingRequests` map only deduplicates an in-flight call. If Gemini fails, the route keeps the deterministic sentences and sets `aiError` to `Smoother wording is unavailable`. That failure path does not save `smoothed: true`.

### Prove

`npm run test:matching` failed. Line 37 of `verify-matching.ts` expects `qaResult.score` to be null. The QA fixture matches `manual software testing` (category `other`), `test-case design` (skill), and `APIs` (tool). The percentage uses only the skill and tool rows, both matched, so `score` is 100. The command printed `100 !== null` and exited 1. The assertions before that line did not complete a passing script.

The script does not call Gemini.

### Measure

Explanation quality and cache hit rate: not measured. The only measured matching result is the failed assertion above.

## 4. Skill-gap recommendations

### Where

- `web/lib/server/skillGapRecommendations.ts`
- `web/lib/skill-gap-recommendations.ts`
- `web/components/internships/MatchPanel.tsx`, heading "How to raise this match"

### How

The route calls `aiSkillGapRecommendations` only when the deterministic percentage is a number and at least one skill or tool row is not met. The prompt limits recommendations to the supplied missing labels. Results are aligned to those labels. An in-memory map caches them by a SHA-256 of the minimized input (`skill-gap-v2`). This cache is not the internship explanation row.

The panel lists skill-name cards. Hover or focus shows "See more". The dialog uses `withCommonLearningSites`, which keeps valid http(s) links and adds a search link when that host is missing for Coursera, Udemy, freeCodeCamp, and LinkedIn Learning. The card text in `MatchPanel.tsx` is the skill name. It does not print `estimatedTime`.

### Prove

No script asserts skill-gap JSON. U04 asked for learning recommendations. That request does not prove the dialog works.

### Measure

Recommendation usefulness: not measured.

## Resume extraction

`web/lib/ai/resumeExtractor.ts` calls Gemini for resume text. It is separate from the internship match percentage. No resume evaluation script was run on 17 November 2026. Result: not measured.

## Failure behavior that was not exercised

Invalid JSON, provider timeout, quota, and database failure were not executed against a live provider or database in this alignment. Expected behavior remains the controlled errors described in F3 and NFR1. Actual live results: not measured.

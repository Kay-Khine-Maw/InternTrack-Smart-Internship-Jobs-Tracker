# Before/After Comparison

Branch: `main`.

Before and after task times were not measured, so change is not measured for those tasks. Questionnaire scores below are copied from the result files. Each reported mean uses five people.

## Comparison table

| Item | Before | After | Change | Method / status | Evidence |
| --- | --- | --- | --- | --- | --- |
| Capture and notes | not measured | not measured | not measured | Five response records describe screenshots, bookmarks, notes, or saved posts, then a one-place record. The interviews were not timed. | [interview-transcripts.md](../discover/interview-transcripts.md) |
| Review and duplicate comments | not measured | not measured | not measured | 5 of 5 response records mention review and/or duplicate warnings. That count is not a task-time change. | [interview-transcripts.md](../discover/interview-transcripts.md) |
| Explicit save and reopen | not measured | not measured | not measured | Session notes exist. Duration was not measured. | [session-log.md](../test/session-log.md) |
| Duplicate script | No earlier run supplied | 7 PASS lines; exit 0 on 17 November 2026 | not measured | `npm run test:duplicates` from `web/`. Seven PASS lines are not seven participant successes. | [measurement-results.md](../test/measurement-results.md) |
| Extraction script | No earlier run supplied | exit 0; script file empty; no PASS line | not measured | `npm run test:extract` from `web/`. Exit 0 does not prove extraction. | [measurement-results.md](../test/measurement-results.md) |
| Authentication and ownership | not measured | not measured | not measured | No timed comparison and no cross-account test result are in the measurement file. | [spec.md](../01-requirements/spec.md); [measurement-results.md](../test/measurement-results.md) |
| Profile, documents, calendar times | not measured | not measured | not measured | Task times were not measured. | [before-after-times-template.md](../test/before-after-times-template.md) |
| SUS | not measured | 72 / 100 (n = 5) | not measured | Odd items (response − 1), even items (5 − response), sum × 2.5; mean of five participants with 10 answers each. The score is 0–100 and is not a percentage of tasks completed. | [sus-results.md](../test/sus-results.md) |
| TAM | not measured | usefulness 4.13 / 5; ease of use 3.67 / 5; intention to use 3.87 / 5 (n = 5) | not measured | Mean of three 1–5 items per subscale, then the mean of five participant scores, as written in the results file. | [tam-results.md](../test/tam-results.md) |
| UTAUT2 | not measured | PE 4.20 / 5; EE 3.60 / 5; SI 3.40 / 5; FC 4.30 / 5; HM 3.50 / 5; BI 4.00 / 5 (n = 5). Price value: not measured. Habit: not measured. | not measured | Equal-weight mean of two items per construct, then the mean of five participant scores. Price value excluded (free prototype; count 0). Habit not assessed (first use; count 0). | [utaut2-results.md](../test/utaut2-results.md) |
| Type check | No earlier run supplied | exit 2; 16 error lines on 17 November 2026 | not measured | `npx tsc --noEmit` from `web/`. Error lines are not a count of distinct defects. | [measurement-results.md](../test/measurement-results.md) |
| Lint, production build, audit | not run | not run | not measured | No command results supplied. | [measurement-results.md](../test/measurement-results.md) |
| AI match percentage and checks | Test expectation: `qaResult.score` is null. That is a script expectation, not a user baseline. | `calculateMatch` returned 100; assertion `100 !== null`; exit 1 | not measured | `npm run test:matching` does not call Gemini. The displayed percentage is the skill and tool count. | [measurement-results.md](../test/measurement-results.md); [ai-logic.md](ai-logic.md) |

## Task times

Before and after task times were not measured. This file does not report a mean, a reduction, or a percentage change for F1–F9 or F13.

## AI row detail

- Item: skill and tool match percentage, explanation smoothing, and skill-gap text.
- Before: no user baseline. `web/lib/server/profileMatchScore.ts` can ask Gemini for a percentage. The match route does not import that file.
- After: the panel percentage is the skill and tool count in `web/lib/matching.ts`. The first "why" sentence comes from that comparison. Later sentences may be rewritten by Gemini. "How to raise this match" shows skill-name cards, See more, and learning links.
- Change: the matching script expected null and received 100. That is not a user-performance change.
- Method: reported matching-script failure on 17 November 2026. The script does not call Gemini, so it does not prove smoothing or the learning dialog.
- Evidence: [measurement-results.md](../test/measurement-results.md) and [ai-logic.md](ai-logic.md).

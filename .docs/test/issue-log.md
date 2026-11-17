# Test Issue Log

Only issues checked against the repository on 17 November 2026 are listed as current. Older claims that were not re-run are not given numbers here. No issue is Accepted.

## ISS-MATCH-01

- Date: 17 November 2026
- Found by: documentation alignment check, from `web/`
- Severity: High for the focused matching check
- Requirement/backlog trace: F14, B25 (explainable matching), B23
- Steps: run `npm run test:matching`
- Expected: `web/scripts/verify-matching.ts` line 37 expects `qaResult.score` to be null
- Actual: `calculateMatch` in `web/lib/matching.ts` returned 100. Node printed `100 !== null` and exit code 1
- Evidence: [measurement-results.md](measurement-results.md), [verify-matching.ts](../../web/scripts/verify-matching.ts)
- Status: Open
- Fix commit: none. The matcher and the script were not changed.
- Retest: not run after a fix

The QA fixture marks three requirements matched, including one with category `other`. The skill-match percentage counts only `skill` and `tool` rows. Those two rows were both matched, so the percentage is 100, and that percentage is copied into `score`.

## ISS-TSC-01

- Date: 17 November 2026
- Found by: documentation alignment check, from `web/`
- Severity: High for a production type check
- Requirement/backlog trace: B23, deferred application-status tracking in the specification
- Steps: run `npx tsc --noEmit`
- Expected: no type errors
- Actual: exit code 2 and 16 error lines, copied in [measurement-results.md](measurement-results.md)
- Files named in that output: `web/app/dashboard/page.tsx`, `web/components/internships/ProgressTimeline.tsx`, `web/components/internships/StatusBadge.tsx`, `web/components/internships/UpdateStatusModal.tsx`, `web/lib/match-explanation.ts`
- Status: Open
- Fix commit: none
- Retest: not run after a fix

## ISS-EXTRACT-01

- Date: 17 November 2026
- Found by: documentation alignment check
- Severity: Medium
- Requirement/backlog trace: F3, B03, B23
- Steps: open `web/scripts/verify-extract.ts` and run `npm run test:extract`
- Expected: assertions for extraction behavior
- Actual: the script file is empty. The command exited 0 and printed no PASS line
- Evidence: [verify-extract.ts](../../web/scripts/verify-extract.ts), [measurement-results.md](measurement-results.md)
- Status: Open
- Fix commit: none

## Interview observations

These come from [interview-transcripts.md](../discover/interview-transcripts.md). 

- U01 was unsure when the draft was saved.
- U02 said some translated words sounded unnatural.
- U03 wanted to know whether personal skills matched the job.
- U04 wanted to know which skills to learn first.
- U05 said some extracted information was incomplete.

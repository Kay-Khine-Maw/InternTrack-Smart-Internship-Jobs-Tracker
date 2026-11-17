# Before/After Measurement Results

Commands below were run from `web/` on 17 November 2026 during documentation alignment. User-task before/after times were not measured. SUS, TAM, and UTAUT2 answers are in the result files linked at the end of this note.

## Script and type-check record

### Duplicate and empty-field script

- Command: `npm run test:duplicates`
- Script: [verify-duplicates.ts](../../web/scripts/verify-duplicates.ts)
- The script defines seven `section()` calls.
- Result: exit 0. Printed output:

```text
PASS 1. Same Google URL twice → modal with Google
PASS 2. Agoda URL after Google exists → Agoda, not Google
PASS 3. New URL → no modal
PASS empty-to-empty company+position never matches
PASS 4. Extract without deadline → empty, not a fake date
PASS 5. Extract without docs → empty list, placeholder only in UI
PASS title match only when both sides have company and position

All duplicate + empty-field scenarios passed.
```

- Before value for the same seven sections: not measured.
- This is a script result using real data. It is not a user-task time.

### Extraction script

- Command: `npm run test:extract`
- Script: [verify-extract.ts](../../web/scripts/verify-extract.ts)
- The file is empty. It contains no assertions.
- Result: exit 0, with no PASS line.
- What this proves: the npm script can start.
- What this does not prove: extraction behavior, missing fields, or provider failure.
- Before/after extraction accuracy: not measured.

### Matching script

- Command: `npm run test:matching`
- Script: [verify-matching.ts](../../web/scripts/verify-matching.ts), assertion at line 37: `assert.equal(qaResult.score, null)`
- Matcher: [matching.ts](../../web/lib/matching.ts) sets `score` from `skillMatch.percentage`.
- Result: exit 1. The assertion failed with `100 !== null`.
- The matcher and the script were not changed.
- Earlier assertions in that run are not a pass, because the process stopped on this assertion.
- User before/after match quality: not measured.

### TypeScript check

- Command: `npx tsc --noEmit`
- Result: exit 2. The command printed these 16 error lines:

```text
app/dashboard/page.tsx(75,25): error TS2802: Type 'MapIterator<[string, number]>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
components/internships/ProgressTimeline.tsx(3,10): error TS2305: Module '"@/lib/types"' has no exported member 'STATUS_LABELS'.
components/internships/ProgressTimeline.tsx(3,25): error TS2305: Module '"@/lib/types"' has no exported member 'TIMELINE_STATUSES'.
components/internships/ProgressTimeline.tsx(3,49): error TS2305: Module '"@/lib/types"' has no exported member 'InternshipStatus'.
components/internships/ProgressTimeline.tsx(11,31): error TS7006: Parameter 'step' implicitly has an 'any' type.
components/internships/ProgressTimeline.tsx(11,37): error TS7006: Parameter 'index' implicitly has an 'any' type.
components/internships/StatusBadge.tsx(2,10): error TS2305: Module '"@/lib/types"' has no exported member 'STATUS_LABELS'.
components/internships/StatusBadge.tsx(2,30): error TS2305: Module '"@/lib/types"' has no exported member 'InternshipStatus'.
components/internships/UpdateStatusModal.tsx(23,10): error TS2305: Module '"@/lib/types"' has no exported member 'INTERNSHIP_STATUSES'.
components/internships/UpdateStatusModal.tsx(23,31): error TS2305: Module '"@/lib/types"' has no exported member 'STATUS_LABELS'.
components/internships/UpdateStatusModal.tsx(23,68): error TS2305: Module '"@/lib/types"' has no exported member 'InternshipStatus'.
components/internships/UpdateStatusModal.tsx(34,11): error TS2339: Property 'setStatus' does not exist on type 'InternshipContextValue'.
components/internships/UpdateStatusModal.tsx(37,74): error TS2339: Property 'status' does not exist on type 'Internship'.
components/internships/UpdateStatusModal.tsx(46,31): error TS2339: Property 'status' does not exist on type 'Internship'.
components/internships/UpdateStatusModal.tsx(76,43): error TS7006: Parameter 'item' implicitly has an 'any' type.
lib/match-explanation.ts(27,14): error TS2802: Type 'MapIterator<[string, string]>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
```

- `StatusBadge.tsx`, `UpdateStatusModal.tsx`, and `ProgressTimeline.tsx` were not imported by other TSX files in a search of `web/` on this date. Application-status tracking remains deferred in [spec.md](../01-requirements/spec.md).
- `npm run lint`, `npm run build`, and `npm audit` were not run. Their results are not measured.

## Interview-answer counts

These counts are readings of [interview-transcripts.md](../discover/interview-transcripts.md). They are not task times, completion rates, or questionnaire scores.

- Supplied response records: U01, U02, U03, U04, U05. Count: 5.
- Post-test answers that say extraction was mostly trusted and the original was checked: 5 of those 5 records.
- Post-test answers that say review and/or duplicate warnings helped: 5 of those 5 records.
- Dates, facilitators, consent, and recordings: not in that file.

## User before/after tasks

- Task time: not measured.
- Independent completion: not measured in this command record. [session-log.md](session-log.md) has reconstructed notes and is not a timed session.
- Error counts: not measured.
- SUS: mean 72/100, five people. Source: [sus-results.md](sus-results.md).
- TAM: usefulness 4.13 / 5, ease of use 3.67 / 5, intention to use 3.87 / 5, five people. Source: [tam-results.md](tam-results.md).
- UTAUT2: PE 4.20, EE 3.60, SI 3.40, FC 4.30, HM 3.50, BI 4.00, five people. Price value and habit were not scored. Source: [utaut2-results.md](utaut2-results.md).

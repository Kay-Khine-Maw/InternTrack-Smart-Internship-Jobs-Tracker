# InternTrack User Guide

## Start

1. Configure the environment as described in the root [README](../../README.md).
2. Start PostgreSQL and the Next.js application.
3. Create or use an approved real-data test account.
4. Sign in.

## Add an internship

1. Open Add Internship.
2. Paste a supported URL or upload a PDF, DOCX, PNG or JPG.
3. Wait for extraction to finish.
4. Review every field against the source.
5. Correct missing or inaccurate values.
6. Choose priority, notes and checklist items.
7. Select Save explicitly.
8. Reopen the saved record to verify persistence.

## Duplicate warning

If a possible duplicate appears, inspect the existing record, return to editing
or explicitly choose the permitted override. Do not assume extraction saved a
record.

## Profile match

On a saved internship, Profile match shows a percentage. That number counts how many skill and tool requirements on the posting are already on the profile. It is not a prediction that the student will be hired.

Why this percentage starts with that count. Later sentences may be rewritten so they are easier to read.

How to raise this match lists missing skill names. See more opens learning links. Those links can include suggestions from Gemini plus Coursera, Udemy, freeCodeCamp, and LinkedIn Learning.

## Privacy

Upload real personal documents only during approved demonstrations. Keep credentials
server-side and do not place secrets in the repository.

## Known limitations

- Application-status tracking is deferred. See the specification.
- No public deployment URL is recorded. Use the local README.
- `web/lib/server/demoUser.ts` does not set a password. Do not invent one.
- On 17 November 2026, `npm run test:matching` failed and `npx tsc --noEmit` printed 16 error lines. See [measurement-results.md](../test/measurement-results.md).
- Five interview response records exist. Before and after task times were not measured.
- Questionnaire means, five people each: SUS 72/100; TAM usefulness 4.13, ease of use 3.67, intention to use 3.87; UTAUT2 PE 4.20, EE 3.60, SI 3.40, FC 4.30, HM 3.50, BI 4.00. Price value and habit were not scored. See the result files under `.docs/test/`.

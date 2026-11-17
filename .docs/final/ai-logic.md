# InternTrack AI Logic and Evidence

## Where

AI calls are intended to run server-side for:

- Structured internship extraction.
- Supported English translation.
- Resume-assisted profile extraction where configured.

Relevant implementation areas:

- `web/lib/ai/`
- `web/app/api/extract/route.ts`
- `web/app/api/translate/route.ts`
- `web/app/api/profile/resume/route.ts`

## How

1. Validate and bound the submitted source.
2. Extract usable text or image content server-side.
3. Send only necessary content to the configured provider.
4. Parse the structured response.
5. Normalize missing strings and lists.
6. Show an editable draft.
7. Require explicit student review and Save before persistence.

## Prove

Record the actual evaluation evidence here:

- Test set/fixtures:
- Baseline behavior:
- Evaluation script or log:
- Number of cases:
- Pass/fail result:
- False-positive or false-negative cases:
- Link to raw evidence:

Current focused evidence includes:

- [verify-extract.ts](../../web/scripts/verify-extract.ts)
- [verify-matching.ts](../../web/scripts/verify-matching.ts)

Interview evidence: all five supplied post-test responses described extraction
as mostly trustworthy but checked against the original source. This supports a
human-review safeguard, not an objective accuracy score.

Source: [interview-transcripts.md](../discover/interview-transcripts.md).

## Measure

- Metric:
- Before definition:
- After definition:
- Result:
- Measurement method:
- Date:
- Limitations:

## Trust and limitations

AI output may be incomplete or incorrect. Missing information must remain
missing or uncertain, and the student must be able to correct the draft.
Confidence or completeness is not proof of factual accuracy.

The project guidance defines Gemini as the sole provider. The current source
must be checked for any other provider fallback before claiming that
implementation fact.

## Failure behavior

Record observed behavior for invalid JSON, provider failure, unavailable source,
missing fields, timeout, quota/rate limit and database failure:

- Scenario:
- Expected:
- Actual:
- Evidence:

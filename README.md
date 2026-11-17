# InternTrack

InternTrack helps university students collect internship opportunities and manage their applications.

Built with Next.js, TypeScript, Prisma and PostgreSQL.
Gemini provides structured extraction and translation.

## Core Workflow

Capture → extract → review and correct → explicitly save → reopen.

## Features

- Capture internship URLs or PDF, DOCX, PNG and JPG files.
- Review and correct extracted information.
- Detect possible duplicates before saving.
- Save and reopen internship records.
- Track priority, documents and notes.
- Manage deadlines, follow-ups and interviews.
- View dates through a calendar.
- Manage profiles and search internship records.
- Upload a PDF or DOCX resume to review profile facts before saving.
- Review internship requirements and view a profile-match percentage counted from skill and tool names. The first explanation sentence comes from that count. Later sentences may be smoothed. Missing skills open as names with learning links. The percentage is not a hiring prediction.
- Translate supported fields into English.

Requirements and acceptance status are recorded in the
[specification](.docs/01-requirements/spec.md) and
[backlog](.docs/01-requirements/backlog.md).

## Authentication and Data Handling

The whole system requires authenticated sessions and server-side ownership checks for protected records.

Shared demo identity is not authentication.
Any remaining demo-user behavior is an implementation limitation.

Application-status tracking is deferred. Existing priority, dates, notes, documents and record editing remain available.

Keep credentials server-side and follow [rule.md](rule.md) for personal-data processing, access, retention and deletion.

## Prerequisites

- Node.js 20 or later and npm.
- PostgreSQL, or Docker with Compose for the provided database service.
- A Gemini API key.
- Playwright browser dependencies for browser-based URL processing.

## Local Setup

From PowerShell at the repository root:

```powershell
cd web
```

For a fresh setup, create local environment files.
Do not overwrite existing configuration:

```powershell
Copy-Item .env.example .env
Copy-Item .env.example .env.local
```

Configure `DATABASE_URL`, `GEMINI_API_KEY` and `GEMINI_MODEL`.
Keep database settings consistent across both files.
Never commit real credentials.

Then run:

```powershell
npm ci
docker compose up -d
npx prisma migrate deploy
npm run db:generate
npx playwright install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

New accounts are isolated from existing demo data and begin with a blank profile and no internships.
The current local setup does not require `DEMO_USER_ID`.

The Docker Compose database is exposed on host port `5433` by default so it can coexist
with a Windows PostgreSQL service using port `5432`.

For a dedicated test database, inspect and verify the seed data before running:

```powershell
npm run db:seed
```

## Verification

Run from `web/`:

```powershell
npm run lint
npm run test:duplicates
npm run test:extract
npm run test:matching
npx tsc --noEmit
npm run build
```

The supplied scripts are focused checks, not complete system tests.

On 17 November 2026, from `web/`: `npm run test:duplicates` printed seven PASS lines; `npm run test:extract` exited 0 and `web/scripts/verify-extract.ts` is empty; `npm run test:matching` exited 1 because the script expects `qaResult.score` to be null and `calculateMatch` returned 100; `npx tsc --noEmit` exited 2 and printed 16 error lines. `npm run lint`, `npm run build`, and `npm audit` were not run. Details: [.docs/test/measurement-results.md](.docs/test/measurement-results.md). These results are not acceptance.

Also verify review and cancellation, duplicate decisions, persistence after reload/restart, failure handling and authorization.
Record actual results against acceptance criteria.

## Important Behavior

- AI output remains a draft until explicitly saved after review.
- Failed database operations must not appear successful.
- Extraction history is separate from saved internships.
- Cancellation does not automatically delete extraction history.
- In-app reminders do not imply email or push delivery.
- Text extraction uses Gemini when `GEMINI_API_KEY` is set. If that key is missing and `OPENAI_API_KEY` is set, text extraction can use OpenAI. Translation uses Gemini only. That matches `CLAUDE.md` and F3. The match route does not take its percentage from Gemini.

## Documentation

- [Proposal](.docs/proposal.md)
- [Specification](.docs/01-requirements/spec.md)
- [Backlog](.docs/01-requirements/backlog.md)
- [Rules](rule.md)
- [Agent guidance](CLAUDE.md)
- [Feature list](.docs/02-design/feature-list.md)
- [User journey](.docs/02-design/user-journey.md)
- [Architecture](.docs/02-design/architecture.md)
- [Design system](.docs/02-design/design-system.md)
- [Prototype](.docs/02-design/prototype/README.md)
- [Web application guide](web/README.md)

## Stop the Local Database

From `web/`:

```powershell
docker compose down
```

This stops the database service without deleting its volume.
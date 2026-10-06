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
- Track status, priority, documents and notes.
- Manage deadlines, follow-ups and interviews.
- View dates through a calendar.
- Manage profiles and search internship records.
- Translate supported fields into English.

Requirements and acceptance status are recorded in the
[specification](.docs/01-requirements/spec.md) and
[backlog](.docs/01-requirements/backlog.md).

## Authentication and Data Handling

The whole system requires authenticated sessions and server-side ownership checks for protected records.

Shared demo identity is not authentication.
Any remaining demo-user behavior is an implementation limitation.

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

If the current code still requires `DEMO_USER_ID`, configure it for local testing only. Track its replacement under F13 / B13.

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
npx tsc --noEmit
npm run build
```

The supplied scripts are focused checks, not complete system tests.

Also verify review and cancellation, duplicate decisions, persistence after reload/restart, failure handling and authorization.
Record actual results against acceptance criteria.

## Important Behavior

- AI output remains a draft until explicitly saved after review.
- Failed database operations must not appear successful.
- Extraction history is separate from saved internships.
- Cancellation does not automatically delete extraction history.
- In-app reminders do not imply email or push delivery.

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
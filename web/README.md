# InternTrack Web Application

This directory contains the Next.js App Router application, using TypeScript, Prisma and PostgreSQL.

See the [root README](../README.md) for setup and configuration.

## Core Workflow

Capture → extract → review and correct → explicitly save → reopen.

Supporting features include profiles, application tracking, checklists, calendar, search, translation and deletion.

## Application Structure

- `app/`: pages and server routes.
- `components/`: shared UI and feature components.
- `lib/`: state, extraction, Gemini integration and server helpers.
- `prisma/`: schema, migrations and seed data.
- `scripts/`: focused verification scripts.
- `public/`: public assets, not private uploaded documents.

## Processing and Storage

- Supported sources include URLs, PDF, DOCX, PNG and JPG.
- Gemini is the sole AI provider for extraction and translation.
- Extracted information remains editable before saving.
- PostgreSQL stores saved records and related data.
- Credentials and database access remain server-side.
- Extraction history follows separate retention and cleanup rules.

## Authentication and Access

The whole system requires authenticated sessions and server-side ownership checks for protected records.

A shared demo user does not provide authenticated isolation.
Any remaining demo-user behavior must be tracked as an implementation limitation under F13 / B13.

## Commands

Run from `web/`:

```bash
npm run dev
npm run lint
npm run test:duplicates
npm run test:extract
npx tsc --noEmit
npm run build
```

For schema development:

```bash
npm run db:migrate
npm run db:generate
```

Create new migrations. Do not rewrite applied migrations.

Keep real credentials out of source control.
Verify seed data before using it for testing.

## Verification

Before accepting affected features, verify:

- Supported inputs and clear errors.
- Review, cancellation and explicit save.
- Duplicate decisions.
- Persistence after reload and restart.
- Provider and database failures.
- Session handling and unauthorized-access rejection.
- Related-data ownership and cleanup.

The supplied scripts are focused checks, not complete end-to-end tests.
Record actual results against specification acceptance criteria.

Implementation status and unresolved gaps belong in the backlog.

## Documentation

- [Specification](../.docs/01-requirements/spec.md)
- [Backlog](../.docs/01-requirements/backlog.md)
- [Architecture](../.docs/02-design/architecture.md)
- [User journey](../.docs/02-design/user-journey.md)
- [Design system](../.docs/02-design/design-system.md)
- [Rules](../rule.md)
- [Agent guidance](../CLAUDE.md)
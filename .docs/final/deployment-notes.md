# Deployment Notes

## Local environment

- Node.js version:
- npm version:
- PostgreSQL version:
- `DATABASE_URL` source:
- `GEMINI_MODEL`:
- Required browser dependencies:

## Deployment procedure

1. Configure secrets through the deployment secret manager.
2. Do not commit `.env` or `.env.local`.
3. Install dependencies with the lockfile.
4. Apply Prisma migrations.
5. Generate Prisma client.
6. Run lint, focused tests, type check and production build.
7. Start the production server.
8. Verify authentication, ownership, extraction, save/reopen and failure paths.

## Operational controls

- Secret storage:
- Database backup/recovery:
- Session management:
- Logging and traffic-retention decision:
- Personal-data retention/deletion:
- Monitoring:
- Rollback:

## Vercel production notes

- Project: `kenguin/intern-track-smart-internship-jobs-tracker`
- Root Directory: `web`
- Production URL: `https://intern-track-smart-internship-jobs.vercel.app`
- Build runs `prisma migrate deploy && next build`
- Runtime prefers `DATABASE_URL_POOLED` when `VERCEL` is set
- URL extraction on Vercel uses `@sparticuz/chromium` + `playwright-core`
- Image OCR language data uses `/tmp` on Vercel
- Required env: `DATABASE_URL`, `DATABASE_URL_POOLED` (recommended), `GEMINI_API_KEY`, `GEMINI_MODEL`
- Sites that block bots or require heavy client rendering may still need a PDF/DOCX/PNG/JPG upload

## Status

Production schema migrations were applied on 20 November 2026. Re-deploy after
code changes that affect serverless extraction or Prisma. This document is not
acceptance.

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

## Status

This document is a deployment checklist, not evidence that a public deployment
has passed.

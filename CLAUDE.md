# InternTrack - CLAUDE.md

## Project

InternTrack is a web application for university students to collect, review, and manage internship applications. It accepts internship URLs and PDF, DOCX, PNG, or JPG uploads; extracts source text; uses Gemini or an OpenAI fallback to identify structured fields; and lets the user correct the result before saving. The app tracks status, priority, deadlines, follow-ups, interviews, required documents, notes, skills, tags, and profile preferences.

The application is a Next.js 14 App Router project in `web/`, backed by PostgreSQL through Prisma. The current build uses a demo user and does not silently fall back to localStorage when the database is unavailable. The product requirements and documentation under `.docs/` are the source of truth for requested behavior.

## Team

- Kay Khine Maw (6631503060)
- Nang Yu Yu Khay (6631503078)
- Nway Nway Zay Ya (6631503081)
- Pyae Shunn Le' Maung (6631503084)
- Thura Aung (6631503094)

## Folder layout

- `CLAUDE.md` — project context and instructions for coding agents
- `rule.md` — legal and compliance rules for personal data, logs, consent, and signatures
- `README.md` — repository setup, architecture, commands, and API overview
- `.docs/` — requirements and project documentation
- `.docs/01-requirements/` — requirements and specification documents
- `web/app/` — pages and Next.js API route handlers
- `web/components/` — layout, internship, modal, and UI components
- `web/lib/` — types, client store, extractors, AI integrations, translations, and server helpers
- `web/prisma/` — Prisma schema, migrations, and seed data
- `web/scripts/` — focused extraction and duplicate-detection verification scripts
- `web/docker-compose.yml` — local PostgreSQL service
- `web/public/` — static assets

## Rules that always apply

- Read `rule.md` before touching personal data, uploaded documents, AI prompts, logs, consent, retention, or signatures. Never disable or temporarily skip a rule in it.
- Read the nearby implementation and relevant requirements before editing. Identify the code path that directly controls the requested behavior.
- Make the smallest change that solves the request. Do not rewrite unrelated files, generated `.next/` output, or user changes.
- Preserve existing routes, API response shapes, Prisma models, status values, and user-facing terminology unless the task explicitly changes them.
- Keep database access in server-side route handlers or server utilities. Never expose Prisma clients, database credentials, or AI provider keys to client components.
- Validate API input at the boundary with the existing Zod patterns. Treat URL content, uploaded files, OCR output, extracted text, and AI responses as untrusted and potentially incomplete.
- Preserve server-side ownership checks, duplicate detection, extraction-history linkage, and the demo-user contract.
- Do not add a localStorage or mock-data fallback that makes users believe data was saved when PostgreSQL persistence failed.
- Do not commit `.env`, `.env.local`, API keys, database credentials, personal data, or production user data.
- Reuse the existing Tailwind, Radix UI, Lucide, and component patterns. Keep forms accessible, responsive, and clear about loading, empty, error, disabled, and correction states.
- For schema changes, update `web/prisma/schema.prisma` and create a new migration. Do not edit an applied migration in place.
- For extraction changes, verify URL and file inputs, missing fields, normalization, provider failures, and user review behavior.
- For API or persistence changes, verify validation, ownership, duplicate handling, error responses, and related database behavior.
- For every new personal-data flow, update the privacy and retention decision and add the required access-control and deletion behavior before calling it complete.
- If anything is unclear, ask for clarification and offer at least three concrete options. Do not guess about product requirements, legal obligations, or destructive data operations.
- Run the narrowest relevant check after the first edit. From `web/`, common checks are `npm run lint`, `npm run test:duplicates`, `npm run test:extract`, and `npm run build`.
- When finished, summarize changed files, validation commands, and any pre-existing failures or unresolved risks.

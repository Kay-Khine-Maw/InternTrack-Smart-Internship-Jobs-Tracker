# InternTrack

Internship tracker for university students. **Real extraction** (Cheerio/Playwright, pdf-parse, mammoth, Tesseract) plus **Gemini structured JSON** (OpenAI fallback), persisted in **PostgreSQL via Prisma**. Mock extraction is disabled.

## Architecture

```
Add Internship UI
  -> POST /api/extract  { url } or multipart file
  -> url/pdf/docx/image extractors return raw text
  -> ExtractionHistory row saved (source + text + date)
  -> lib/ai/internshipExtractor.ts (Gemini, OpenAI fallback)
  -> Review (verify AI, fill missing fields)
  -> POST /api/internships  (Prisma)
  -> GET/PUT/DELETE /api/internships
```

## Setup

```bash
cd web
copy .env.example .env
copy .env.example .env.local
# Prisma CLI reads .env. Next.js reads .env.local.
# Set GEMINI_API_KEY (preferred) or OPENAI_API_KEY in both for live extraction.

docker compose up -d
npm install
npx prisma migrate dev --name init
npx prisma db seed
npx playwright install
npm run dev
```

Open http://localhost:3000

### Environment (`.env.example`)

- `DATABASE_URL` — Postgres connection
- `DEMO_USER_ID` — seeded demo user (`demo-user-nway`)
- `GEMINI_API_KEY` — preferred for extraction (503 if neither Gemini nor OpenAI is set)
- `GEMINI_MODEL` — default `gemini-flash-lite-latest` (use a model id from ListModels for this API key)
- `OPENAI_API_KEY` — optional fallback
- `OPENAI_MODEL` — default `gpt-4o-mini`

## Demo flow

1. Dashboard loads internships from Postgres (seed includes Google / Agoda / Microsoft).
2. Add Internship → paste URL or upload PDF/DOCX/PNG/JPG.
3. Loading copy: **Uploading...** → **Extracting text...** → **Analyzing internship information...**
4. Review AI fields. Missing fields show: `Information not detected. Please complete manually.`
5. Save Internship → **Saving...** → `/internships/[id]`

Duplicate URL or company+position opens **This internship may already exist.** with View Existing / Add Anyway.

## Notes

- Extraction history is stored even if you cancel the review.
- Playwright browsers: `npx playwright install`
- Without Postgres, list/save APIs return a database error (no silent localStorage fallback).

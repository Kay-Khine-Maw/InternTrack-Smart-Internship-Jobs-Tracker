# InternTrack

InternTrack is a full-stack internship tracker for university students. It helps you collect internship postings, extract their details from links or uploaded documents, review the extracted information, and manage each application through its deadline and interview stages.

The application lives in [`web/`](web/), and uses Next.js, TypeScript, PostgreSQL, and Prisma.

## Features

- Track internships by status: saved, preparing, applied, interview, accepted, or rejected.
- Set priorities, tags, deadlines, follow-up dates, interview details, notes, and preparation notes.
- Add an internship from a URL or upload a PDF, DOCX, PNG, or JPG file.
- Extract text with Cheerio/Playwright, `pdf-parse`, Mammoth, or Tesseract OCR.
- Convert extracted text into structured internship fields with Gemini, with OpenAI as an optional fallback.
- Review and correct AI-generated fields before saving.
- Detect likely duplicate internships by URL or company and position.
- Track required documents with completion checkboxes.
- Translate supported fields into English while reviewing an internship.
- View internships, profile information, and application dates from the dashboard and calendar.

## Tech Stack

- Next.js 14 App Router
- React 18 and TypeScript
- PostgreSQL 16
- Prisma ORM
- Tailwind CSS and Radix UI
- Gemini API with optional OpenAI fallback
- Playwright, Cheerio, `pdf-parse`, Mammoth, and Tesseract.js for extraction

## Prerequisites

- Node.js 20 or later
- npm
- Docker Desktop with Docker Compose
- A Gemini API key or OpenAI API key for live AI extraction

## Getting Started

From the repository root:

```bash
cd web
copy .env.example .env
copy .env.example .env.local
npm install
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npx playwright install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Prisma CLI reads `.env`, while Next.js reads `.env.local`. Put the same database and AI settings in both files. The local Docker database uses the default connection string already present in `.env.example` unless you change it.

## Environment Variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://interntrack:interntrack@localhost:5432/interntrack?schema=public` |
| `DEMO_USER_ID` | User used by the demo application | `demo-user-nway` |
| `GEMINI_API_KEY` | Preferred provider for structured extraction and translation | none |
| `GEMINI_MODEL` | Gemini model name | `gemini-flash-lite-latest` |
| `OPENAI_API_KEY` | Optional fallback provider | none |
| `OPENAI_MODEL` | OpenAI fallback model | `gpt-4o-mini` |

At least one of `GEMINI_API_KEY` or `OPENAI_API_KEY` is needed for live AI extraction. Without PostgreSQL, the internship list and save endpoints return a database error; there is no silent local-storage fallback.

## Typical Flow

1. Open **Add Internship** and paste a job URL or upload a supported file.
2. InternTrack extracts the source text and stores an extraction-history record.
3. The AI provider identifies fields such as company, position, location, deadline, requirements, skills, documents, application URL, and HR email.
4. Review the result, fill in missing fields, and choose a priority.
5. Save the internship and manage its documents, status, notes, and application timeline.

Duplicate URLs or matching company and position values trigger a warning before a second record is created. Extraction history is retained even if the review is cancelled.

## Useful Commands

Run these from `web/`:

```bash
npm run dev             # Start the development server
npm run build           # Create a production build
npm run start           # Serve the production build
npm run lint            # Run Next.js linting
npm run db:migrate      # Create/apply a development migration
npm run db:seed         # Load the demo profile and internships
npm run db:generate     # Regenerate the Prisma client
npm run test:duplicates # Verify duplicate detection
npm run test:extract    # Verify extraction behavior
```

To stop the local database:

```bash
docker compose down
```

To remove the database volume and all local data as well:

```bash
docker compose down -v
```

## API Overview

- `POST /api/extract` extracts text and structured internship data from a URL or multipart file upload.
- `GET /api/internships` lists internships for the demo user.
- `POST /api/internships` creates an internship after duplicate validation.
- `GET /api/internships/:id` returns one internship.
- `PUT /api/internships/:id` updates an internship, documents, tags, status, and timeline fields.
- `DELETE /api/internships/:id` removes an internship.
- `GET /api/profile` and `PUT /api/profile` read and update the demo profile.
- `POST /api/translate` translates supported internship fields into English.

## Project Structure

```text
.
├── web/
│   ├── app/                  # Pages and Next.js route handlers
│   ├── components/           # Layout, internship, modal, and UI components
│   ├── lib/                  # Store, types, extractors, AI, and server helpers
│   ├── prisma/               # Schema, migrations, and seed data
│   ├── scripts/              # Verification scripts
│   └── docker-compose.yml     # Local PostgreSQL service
├── .docs/                    # Project documentation and requirements
└── README.md
```

## Notes

- The seeded demo data includes a profile and sample internships for Google, Agoda, Microsoft, and Shopee.
- Playwright browsers must be installed before URL extraction can use browser-based loading.
- OCR uses the bundled English Tesseract data file at `web/eng.traineddata`.
- This repository currently uses a demo user rather than a full authentication flow.

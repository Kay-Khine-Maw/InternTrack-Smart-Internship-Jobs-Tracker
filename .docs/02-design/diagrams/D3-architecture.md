# D3 — InternTrack Architecture

Current implementation: one Next.js application with browser UI and server-side route handlers. Docker Compose supplies PostgreSQL locally; it does not deploy the complete application.

```mermaid
flowchart TB
    subgraph Browser["Student browser"]
        UI["React pages and components<br/>Dashboard, add/review, list/detail, calendar, profile"]
        Store["Client state and API access<br/>lib/store.tsx"]
        UI <--> Store
    end
    subgraph Server["Next.js 14 server — Node.js"]
        API["Route handlers<br/>/api/extract, /api/internships, /api/internships/:id<br/>/api/profile, /api/translate"]
        Rules["Validation, demo-user selection,<br/>duplicate detection and data mapping"]
        Readers["Source readers<br/>URL: Cheerio / Playwright<br/>PDF: pdf-parse; DOCX: Mammoth<br/>Image fallback: Tesseract OCR"]
        AIService["AI extraction and translation adapters<br/>Image vision attempt; structured text extraction"]
        ORM["Prisma client"]
        API --> Rules
        API --> Readers
        API --> AIService
        Readers -->|"Extracted text"| AIService
        API --> ORM
        Rules --> ORM
    end
    subgraph LocalDB["Local Docker Compose service"]
        DB[("PostgreSQL 16<br/>User, Profile, Internship, Document,<br/>Tag, ExtractionHistory")]
        Volume["Persistent database volume"]
        DB --- Volume
    end
    Websites["External posting websites"]
    Providers["External AI APIs<br/>Gemini preferred; OpenAI when Gemini key is absent"]
    Store <-->|"HTTP requests and JSON responses"| API
    Readers <-->|"Fetch posting pages"| Websites
    AIService <-->|"Source text or image / AI results"| Providers
    ORM <-->|"Database queries and updates"| DB
```

Image uploads first attempt AI vision; unusable or failed vision results fall back to OCR and text extraction. The diagram groups these branches into the extraction components rather than implying every upload uses OCR.

Translations are JSON on `Internship`, not a separate translation table. `Document` stores checklist metadata. Extraction history may exist without a saved internship. Credentials belong on the server; the browser does not connect directly to PostgreSQL or AI providers.

Production authentication and retention/deletion automation remain backlog work. This diagram documents structure, not certification that every security requirement has been implemented.

Evidence: `web/package.json`; `web/docker-compose.yml`; `web/prisma/schema.prisma`; `web/app/api/extract/route.ts`; `web/lib/ai/internshipExtractor.ts`; `web/lib/extractors/`.

Provider detail: structured text extraction selects Gemini when its key is present; otherwise it selects OpenAI. It does not automatically switch to OpenAI after a Gemini failure. Image vision uses Gemini.

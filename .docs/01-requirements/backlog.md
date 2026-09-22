# InternTrack Product Backlog

## Traceability Note

No interview transcripts or validated pain notes are currently present in `.docs`. `P1` through `P8` are provisional problem statements from `spec.md`; replace them with confirmed research references when those notes are added. Every item below traces to at least one functional, non-functional, or legal requirement.

## Status Definitions

- **Done:** behavior is present in the current repository and has an existing implementation surface.
- **Ready:** requirements are clear enough to implement, but the behavior is not complete or is not verified end to end.
- **Backlog:** intentionally deferred until a prerequisite, product decision, or research input exists.

## Items

### B01 - Dashboard pipeline summary

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want to see totals by application status and items needing attention, so that I know what to work on next.
- Traces to: F7, F9, P3, P7
- Evidence in code: `web/app/dashboard/page.tsx`

### B02 - Capture internship from URL or file

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want to paste a posting URL or upload a document, so that I can capture an internship quickly.
- Traces to: F2, P1, P2
- Evidence in code: `web/app/add-internship/page.tsx`, `web/app/api/extract/route.ts`

### B03 - Multi-format source extraction

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want URLs, PDFs, DOCX files, and images processed, so that the source format does not block tracking.
- Traces to: F3, NFR4, P2
- Evidence in code: `web/lib/extractors/`, `web/lib/extract.ts`

### B04 - AI structured extraction with review

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want extracted fields presented for correction before saving, so that AI mistakes do not become trusted records.
- Traces to: F3, F4, LR2, P5
- Evidence in code: `web/lib/ai/internshipExtractor.ts`, `web/app/add-internship/page.tsx`

### B05 - Persist internships in PostgreSQL

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want reviewed records saved reliably, so that my application pipeline persists across sessions.
- Traces to: F5, NFR1, NFR3, P1
- Evidence in code: `web/app/api/internships/route.ts`, `web/prisma/schema.prisma`

### B06 - Duplicate warning and explicit override

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want duplicate warnings before saving, so that I do not accidentally create copies.
- Traces to: F6, P6
- Evidence in code: `web/lib/server/duplicates.ts`, `web/components/modals/DuplicateWarningModal.tsx`

### B07 - Internship list and detail management

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want to open and edit a saved internship, so that one record contains the complete application context.
- Traces to: F7, F8, F12, P7
- Evidence in code: `web/app/internships/page.tsx`, `web/app/internships/[id]/page.tsx`, `web/app/api/internships/[id]/route.ts`

### B08 - Document checklist

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want to mark application documents complete, so that I can see what is still missing.
- Traces to: F8, P4
- Evidence in code: `web/components/internships/DocumentChecklist.tsx`, `web/prisma/schema.prisma`

### B09 - Calendar deadlines and interviews

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want deadlines, follow-ups, and interviews shown on a calendar, so that time-sensitive actions are visible.
- Traces to: F9, P3, P7
- Evidence in code: `web/app/calendar/page.tsx`

### B10 - Profile view and editing

- Type: Feature
- Priority: Must
- Status: Done
- User story: As a student, I want to maintain my academic and skills profile, so that my application preparation context is current.
- Traces to: F1, LR1
- Evidence in code: `web/app/profile/page.tsx`, `web/app/api/profile/route.ts`

### B11 - Field-level English translation

- Type: Feature
- Priority: Should
- Status: Done
- User story: As a student, I want supported fields translated into English without losing the original, so that I can review non-English postings.
- Traces to: F11, P8
- Evidence in code: `web/components/internships/FieldTranslateBar.tsx`, `web/app/api/translate/route.ts`

### B12 - Extraction and personal-data retention policy

- Type: Compliance
- Priority: Must
- Status: Ready
- User story: As a data subject, I want my profile, source text, and derived extraction data retained only for a stated purpose and period, so that unnecessary personal data is not kept indefinitely.
- Traces to: LR1, LR3, LR8, NFR3
- Next step: define retention periods and deletion or anonymisation jobs for `ExtractionHistory`, profiles, internships, documents, and translations.

### B13 - Production authentication and ownership

- Type: Security
- Priority: Must
- Status: Backlog
- User story: As a student, I want only my authenticated account to access my records, so that another user cannot read or modify my applications.
- Traces to: F1, F5, F12, LR4, NFR3
- Dependency: choose the authentication provider and replace the demo-user boundary.

### B14 - Personal-data export and deletion

- Type: Compliance
- Priority: Must
- Status: Backlog
- User story: As a data subject, I want to export, correct, or delete my personal data, so that I can exercise my data rights.
- Traces to: LR4, LR8
- Dependency: implement authentication and define retention exceptions.

### B15 - Request traffic logging for production

- Type: Security
- Priority: Must
- Status: Backlog
- User story: As a service operator, I want tamper-evident traffic metadata retained for the required period, so that the deployed service meets applicable logging obligations.
- Traces to: LR5, LR6
- Next step: add central append-only logging for timestamp, IP, route, method, status, bytes, user/session ID when available, and user-agent without request bodies.

### B16 - Privacy notice and AI processor disclosure

- Type: Compliance
- Priority: Must
- Status: Backlog
- User story: As a student, I want to know what data is sent to Gemini or OpenAI and why, so that I can make an informed decision about using extraction and translation.
- Traces to: LR1, LR2, NFR3
- Dependency: confirm production provider, region, retention behavior, and lawful basis.

### B17 - Research validation of product pains

- Type: Research
- Priority: Must
- Status: Backlog
- User story: As a product team, we want every requirement tied to interview evidence, so that the backlog reflects real student problems rather than assumptions.
- Traces to: P1, P2, P3, P4, P5, P6, P7, P8
- Next step: add interview notes or a research synthesis under `.docs/`, then replace provisional P# references with source identifiers.

### B18 - Notifications and reminders

- Type: Feature
- Priority: Could
- Status: Backlog
- User story: As a student, I want reminders for deadlines, follow-ups, and interviews, so that I do not miss time-sensitive application actions.
- Traces to: F9, P3
- Dependency: notification channel decision, consent design, and the privacy rules for contact data.

### B19 - Multi-user sharing and collaboration

- Type: Feature
- Priority: Won't for current build
- Status: Backlog
- User story: As a student, I want to share an internship record with a trusted reviewer, so that I can get help preparing an application.
- Traces to: F5, LR4
- Dependency: authentication, role-based access, sharing consent, audit logging, and private document delivery.

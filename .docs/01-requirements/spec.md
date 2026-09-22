# InternTrack Requirements Specification

## Document Status

- Product phase: Build baseline
- Product: Internship tracking and application preparation web app
- Primary implementation: `web/` (Next.js 14, PostgreSQL, Prisma)
- Source of truth: this specification, the backlog, and the legal rules in `rule.md`
- Research status: no interview transcripts or validated pain notes are currently stored in `.docs`; the P# references below are provisional and must be replaced or confirmed when research evidence is added.

## Product Goal

Help university students turn scattered internship postings into an organised application pipeline. A user should be able to capture a posting, recover its important details, correct anything the extractor missed, and keep deadlines, documents, follow-ups, and interviews in one place.

## Users and Actors

- **Student user:** owns a profile and internship records, reviews extracted data, and manages applications.
- **AI provider:** Gemini is preferred; OpenAI may be used as a fallback for structured extraction or translation. It must receive only the minimum required text.
- **Source website or document:** provides internship content through a URL or uploaded PDF, DOCX, PNG, or JPG.
- **Database:** PostgreSQL stores users, profiles, internships, documents, tags, translations, and extraction history through Prisma.

## Provisional Problem Statements

These are placeholders until interview evidence is added to `.docs`:

- **P1:** Internship details are spread across job boards, emails, and documents.
- **P2:** Manually copying company, role, deadline, and requirements is repetitive and error-prone.
- **P3:** Important deadlines and follow-ups are easy to miss when tracked separately.
- **P4:** Students do not always know which documents are still missing for an application.
- **P5:** Extracted or copied information may be incomplete and needs a clear review step.
- **P6:** Duplicate saves make an internship pipeline difficult to trust.
- **P7:** Application progress, interview preparation, and notes are not visible in one workflow.
- **P8:** Users may need English translations while reviewing non-English internship information.

## Functional Requirements

### F1. Profile Management

**Priority: Must**

As a student, I want to view and update my profile, so that my academic background, skills, tools, preferred fields, and preferred location are available while preparing applications.

Acceptance criteria:

- The profile supports display name, major, year, bio, university, email, location, preferred fields, preferred location, skills, and tools.
- Profile data is loaded from and saved to PostgreSQL for the active user.
- Invalid or incomplete requests return a clear validation error without partially saving the update.
- Profile access is protected by a server-side ownership boundary when authentication is introduced.

### F2. Capture an Internship Source

**Priority: Must**

As a student, I want to paste an internship URL or upload a supported document, so that I can start a record without manually retyping the posting.

Acceptance criteria:

- URL input accepts a valid source URL and submits it to `/api/extract`.
- Upload input supports PDF, DOCX, PNG, and JPG files and submits multipart form data.
- Unsupported, empty, unreadable, or failed inputs produce an actionable error.
- The source URL or filename is retained with extraction history where available.

### F3. Extract and Normalize Internship Information

**Priority: Must**

As a student, I want the source converted into structured fields, so that I can review company, position, location, deadline, description, requirements, documents, application URL, HR email, and skills.

Acceptance criteria:

- URL extraction can use the existing URL extractor and browser fallback.
- PDF, DOCX, and image inputs use the corresponding existing extractor.
- Gemini is preferred and OpenAI may be used as a configured fallback.
- The response normalizes missing strings to null and missing lists to empty arrays.
- Dates are normalized to an ISO-compatible date where a deadline can be identified.
- AI failure, invalid JSON, and missing usable content are returned as controlled errors.

### F4. Review and Correct Extracted Data

**Priority: Must**

As a student, I want to review and edit extracted fields before saving, so that incomplete or inaccurate AI output does not become trusted application data.

Acceptance criteria:

- The review screen shows extracted values and clearly identifies missing fields.
- Company and position are required before save.
- The user can edit scalar fields and add or remove requirements, skills, and documents.
- The user can set priority and notes before saving.
- The review can be cancelled without creating an internship record.

### F5. Persist Internship Records

**Priority: Must**

As a student, I want to save a reviewed internship, so that it remains available in my application pipeline.

Acceptance criteria:

- A saved record includes company, position, location, deadline, description, requirements, skills, documents, URLs, HR email, notes, status, priority, tags, and source linkage where supplied.
- New records default to `saved` status and `medium` priority when the user does not choose otherwise.
- Extraction history is linked to the saved internship when an extraction produced the draft.
- Database failures are shown to the user and never presented as a successful save.

### F6. Detect Duplicate Internships

**Priority: Must**

As a student, I want duplicate warnings before saving, so that my pipeline does not contain accidental copies.

Acceptance criteria:

- Matching source or application URLs can trigger a duplicate warning.
- Matching company and position can trigger a duplicate warning when URL matching is unavailable.
- The warning offers a route to view the existing record and an explicit option to add anyway.
- Duplicate checks are enforced by the server, not only by the client.

### F7. Manage the Application Lifecycle

**Priority: Must**

As a student, I want to change an internship's status and priority, so that the pipeline reflects my current progress.

Acceptance criteria:

- Status supports saved, preparing, applied, interview, accepted, and rejected.
- Priority supports high, medium, and low.
- Status and priority changes persist through the internship API.
- The detail view and dashboard show the current values consistently.

### F8. Track Documents and Preparation

**Priority: Must**

As a student, I want a checklist for each internship, so that I know which application documents are complete.

Acceptance criteria:

- Documents can be added, renamed, removed, and marked complete.
- Document progress is visible on internship cards or detail views where applicable.
- Preparation notes can be saved independently from the internship description.
- Document and note updates respect the internship ownership boundary.

### F9. Track Dates and Calendar Events

**Priority: Must**

As a student, I want deadlines, follow-ups, and interviews on a calendar, so that time-sensitive actions are visible together.

Acceptance criteria:

- The calendar displays deadline, follow-up, and interview events.
- Selecting an event opens the related internship.
- Interview date, time, and link are editable on the internship record.
- The dashboard highlights upcoming or overdue deadlines.

### F10. Search, Filter, and Review the Pipeline

**Priority: Should**

As a student, I want to browse my internships by status, priority, tags, and searchable details, so that I can focus on the applications that need action.

Acceptance criteria:

- The internship list loads records from the API and handles loading and database-error states.
- Users can open a record from the list and return without losing the list context.
- Filters and search do not mutate stored data.
- Empty results explain how to add or adjust records.

### F11. Translate Review Fields

**Priority: Should**

As a student, I want to translate supported extracted fields into English, so that I can understand and edit postings in a consistent language.

Acceptance criteria:

- Translation is available for supported scalar and list fields.
- Original text remains available and is not overwritten unintentionally.
- Translation failures are shown at field level and do not block editing other fields.
- Translation data is persisted only with the related internship or review draft.

### F12. Remove an Internship

**Priority: Should**

As a student, I want to delete an internship, so that my pipeline stays current.

Acceptance criteria:

- Deletion requires a clear confirmation action.
- The server verifies ownership before deleting.
- Related documents are removed according to the Prisma relationship rules.
- The UI removes the record only after the server confirms success.

## Non-Functional Requirements

- **NFR1 Reliability:** Every asynchronous load, extract, translate, create, update, and delete action must expose loading and failure states; a failed persistence request must not look successful.
- **NFR2 Validation:** API handlers must reject malformed request bodies with a 4xx response and a user-safe message; unexpected failures must not expose secrets or stack traces.
- **NFR3 Security:** Database writes and reads must remain server-side, credentials must come from environment variables, and user-owned records must be checked on the server.
- **NFR4 Data quality:** Extracted values must be normalized before persistence, and users must be able to correct all fields that can be saved.
- **NFR5 Accessibility:** Interactive controls must have labels or accessible names, support keyboard use, and expose meaningful disabled and error states.
- **NFR6 Responsiveness:** Core dashboard, list, detail, add, and calendar flows must remain usable on narrow and wide viewports without horizontal scrolling caused by the application layout.
- **NFR7 Performance target:** For a normal database-backed list request on a local development environment, the UI should render the loaded state within 2 seconds after the response is available. Extraction duration is provider and source dependent and must show progress instead of a fixed performance promise.
- **NFR8 Maintainability:** Schema changes require Prisma migrations; behavior changes require a focused verification command or documented reason why a test is unavailable.

## Legal Requirements

Each legal requirement cites the controlling section in `rule.md`:

- **LR1 Data purpose and minimisation:** Every new personal-data field must have a purpose, lawful basis, retention period, and access scope. Trace: `rule.md` -> `PDPA`.
- **LR2 External AI processing:** AI requests must contain only the minimum necessary source text and must not include account identifiers, tokens, or unrelated profile data. Trace: `rule.md` -> `PDPA`.
- **LR3 Uploaded documents:** Uploaded resumes, transcripts, portfolios, images, and extracted text must be private and protected from public access. Trace: `rule.md` -> `PDPA`.
- **LR4 Ownership:** Profile, internship, document, extraction-history, translation, and future export operations require server-side ownership checks. Trace: `rule.md` -> `PDPA`.
- **LR5 Secrets and logs:** Credentials and personal content must not appear in source control, application logs, error messages, or telemetry. Trace: `rule.md` -> `PDPA`; `Computer Crime Act Section 26`.
- **LR6 Traffic records:** A public deployment must preserve the required traffic metadata for at least 90 days without logging request bodies or personal content. Trace: `rule.md` -> `Computer Crime Act Section 26`.
- **LR7 Acceptance records:** Any future terms acceptance, subscription, or signature must record the exact version, actor, timestamp, and intent evidence. Trace: `rule.md` -> `Electronic Transactions Act`.
- **LR8 Retention and deletion:** Personal-data tables and extraction history must have a documented retention decision and deletion or anonymisation path. Trace: `rule.md` -> `PDPA`.

## Out of Scope for the Current Build

- Full authentication and multi-user tenancy
- Sharing internships with other users
- Sending emails or notifications
- Payments or subscriptions
- Chat or messaging
- Electronic signatures and contracts
- Production file storage beyond the current extraction workflow
- Personalised recommendations based on analytics

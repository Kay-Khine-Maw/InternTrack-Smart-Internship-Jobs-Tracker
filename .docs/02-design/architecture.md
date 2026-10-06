# InternTrack Architecture

## Purpose and Status

This document describes the whole-system architecture of InternTrack.

It defines the intended components, responsibilities and data flows. The backlog records implementation gaps and verification status.

A component shown here is not automatically implemented or accepted.

## Architectural Overview

InternTrack uses a Next.js application with server-side route handlers, Prisma and PostgreSQL.

Gemini is the sole AI provider for extraction and translation.

Core workflow:

Capture → extract → review and correct → explicitly save → reopen.

Supporting workflows cover profiles, application tracking, checklists, dates, search, translation and deletion.

## 1. Browser Interface

The browser provides:

- Sign-in and sign-out.
- Dashboard.
- Internship list.
- Add Internship.
- Review form.
- Internship detail.
- Calendar.
- Profile.

Client state and page/component handlers communicate with server routes.

The browser must not connect directly to PostgreSQL or expose provider credentials.

The interface shows loading, validation, empty and failure states. It confirms changes only after successful server responses.

## 2. Authentication and Authorization

Authentication establishes the Student's identity.
Authorization determines which records that Student may access.

The server must:

- Verify sessions for protected operations.
- Reject missing, invalid or expired sessions.
- Derive identity from the verified session.
- Check ownership before reading or changing records.
- Check related documents, extraction history and translations.
- Invalidate the relevant session on sign-out.

The authentication method and provider remain implementation decisions.
Their configuration and status must be recorded in the backlog.

Trace: F13, NFR3, LR4; B13, B22.

## 3. Server Routes

Server routes handle requests between the browser and internal services.

### Extraction

`POST /api/extract`

- Validate the source and processing limits.
- Coordinate source reading and Gemini processing.
- Return a structured draft or controlled error.
- Manage permitted extraction-history records.

### Translation

`POST /api/translate`

- Validate the requested fields.
- Send necessary content to Gemini.
- Return translated values or field-level errors.
- Preserve the relationship to the original information.

### Internship Records

`GET /api/internships`

- Return authorized internship records.

`POST /api/internships`

- Validate reviewed fields and related references.
- Evaluate duplicate policy.
- Persist the intended record and related data.

`GET /api/internships/:id`

- Return an authorized record.

`PUT /api/internships/:id`

- Update authorized fields and related data.

`DELETE /api/internships/:id`

- Delete the authorized record.
- Handle related data under retention rules.

### Profile

`GET /api/profile`

- Return the authenticated Student's profile.

`PUT /api/profile`

- Validate and save authorized profile changes.

### Authentication Routes

Authentication endpoints depend on the selected approach.

## 4. Source Processing

Source readers prepare internship content for structured extraction.

### Websites

- Retrieve supported posting URLs.
- Use website parsing and browser fallback where needed.
- Restrict unsafe destinations and resource use.
- Apply the restrictions to redirects and browser requests.

### PDF Documents

- Read available document text.
- Detect empty or unusable results.
- Return clear errors for unsupported content.

### DOCX Documents

- Read document text.
- Preserve useful content for extraction.
- Reject unreadable or invalid documents.

### Images

- Use supported vision or OCR processing.
- Record format and language limitations.
- Report unusable input clearly.

Image and text-document paths may differ. Do not assume every path creates history or calls Gemini in the same order.

Trace: F2, F3, NFR2, NFR4; B02, B03, B22.

## 5. Gemini Integration

Gemini provides:

- Structured internship extraction.
- English translation of supported fields.

Provider calls occur on the server.

The integration must:

- Send only necessary source content.
- Keep credentials private.
- Validate and normalize responses.
- Preserve missing or uncertain information.
- Handle provider errors and processing limits.
- Return editable drafts rather than trusted final records.

The system does not define another AI provider or automatic provider failover.

Profile information is not automatically included in extraction.
Profile-driven personalization requires a separate scope decision.

Trace: F3, F4, F11, LR2; B03, B04, B11, B16.

## 6. Application Logic

Server-side application logic coordinates:

- Input validation.
- Authorization.
- Duplicate detection.
- Record and relationship validation.
- Status and priority updates.
- Date handling.
- Translation associations.
- Persistence and failure recovery.

Duplicate checks operate within the Student's authorized records.

The system must distinguish an extraction-time duplicate hint from an override during an explicit save attempt.

An extraction-time warning must not save a draft.

## 7. Persistence

PostgreSQL stores application data through Prisma and any documented server-side database helpers.

Main data areas include:

- Users.
- Profiles.
- Internships.
- Document checklist items.
- Tags.
- Extraction history.
- Translation data.

These are data areas, not a claim that each has an identical Prisma model or relationship.

### Ownership

Each user-owned record must have an enforceable ownership path.

Related-record operations must verify both the parent relationship and the authorized user.

### Data Integrity

- Validate references before linking records.
- Keep multi-step writes consistent.
- Use transactions where operations must succeed together.
- Handle retries without unintended duplicate records.
- Return success only when the intended operation succeeds.

### Schema Changes

- Record schema changes through migrations.
- Do not rewrite applied migrations.
- Review effects on existing records and retention behavior.

Trace: F1, F5, F7–F12, NFR1, NFR3; B05, B07–B11, B23.

## 8. Core Request Flow

1. The Student signs in.
2. The Student provides a URL or supported file.
3. The server verifies the session and validates the input.
4. Source processing and Gemini produce a draft.
5. The Student reviews and corrects the draft.
6. The Student explicitly selects Save.
7. The server validates fields, ownership and references.
8. The server evaluates duplicate policy.
9. The Student resolves any required duplicate decision.
10. The server persists the intended record.
11. The interface opens the saved detail.
12. The Student reloads or reopens the record.

Failure at any stage must produce an appropriate response. A failed operation must not appear successful.

## 9. Supporting Data Flows

### Profile

Browser → authenticated profile route → validation → authorized profile persistence.

### Status, Priority and Checklist

Browser → authenticated internship route → record and nested-resource checks → update → confirmed result.

### Calendar

Authorized internship dates → calendar presentation → selected internship detail. Date and time interpretation must be consistent across views.

### Search

Search/filter controls → authorized record selection → matching results.

The chosen implementation may filter on the client or server.
It must preserve authorization and meet performance requirements.

### Translation

Selected supported fields → server → Gemini → validated translation → review or authorized persistence.

### Deletion

Student confirmation → server authorization → deletion and related-data handling → confirmed UI update.

## 10. Privacy, Retention and Logging

### Privacy

Keep personal content private. Minimize data collected and sent to external processors.

Document relevant purposes, processor handling and notices before personal-data processing.

### Retention

Retention decisions must cover:

- Saved records.
- Source and extracted content.
- Translations.
- Successful extraction history.
- Failed, cancelled and orphaned processing records.

Cancelling a draft does not automatically delete history. Deleting an internship does not automatically prove that all related data was removed.

### Logging

Keep traffic/security metadata separate from application content.

Do not put credentials, uploaded content or unnecessary personal information in logs.

Apply the logging and retention obligations established under `rule.md`.

### Personal-Data Requests

The system must support applicable rights handling, with appropriate identity verification and documented exceptions.

Trace: LR1–LR6, LR8; B12, B14–B16, B27.

## 11. System Boundaries

- **Browser → server:** verify sessions and validate requests.
- **Server → website:** restrict destinations and processing resources.
- **Server → Gemini:** minimize content and protect credentials.
- **Server → database:** enforce ownership and valid relationships.
- **Application → logs:** exclude secrets and unnecessary content.
- **User → protected record:** verify authorization for each operation.

Instructions inside websites, files or AI output must not override application rules.

## 12. Runtime and Deployment

The local setup uses the Next.js application and PostgreSQL. Docker Compose provides the documented local database service.

A deployed environment must define:

- Application and database hosting.
- Authentication configuration.
- Secret management.
- Secure network connections.
- Database migrations.
- Backup and recovery arrangements.
- Logging and monitoring.
- Retention and cleanup.
- Relevant resource and processing limits.

This document does not claim a public deployment exists or that deployment checks have passed.

## 13. Verification

Verify the architecture through observable behavior:

- Sign-in, sign-out and session expiry.
- Rejection of unauthorized access.
- Supported source processing.
- Editable drafts and explicit save.
- Duplicate decisions.
- Persistence after reload and restart.
- Nested-record integrity.
- Provider and database failures.
- Retention and deletion behavior.
- Accessible and responsive interfaces.

## 14. Scope Boundaries

The current specification excludes:

- Record sharing.
- Employer or career-staff accounts.
- Outbound email or push notifications.
- Payments and messaging.
- Electronic signatures and contracts.
- External employer or university integrations.
- Long-term application-document hosting.
- Automated job applications.
- Analytics-based recommendations.
- Profile-driven AI personalization.

These require a separate scope and architecture review.

## 15. Related Documents

- [Specification](../01-requirements/spec.md)
- [Backlog](../01-requirements/backlog.md)
- [Rules](../../rule.md)
- [Feature list](feature-list.md)
- [User journey](user-journey.md)
- [Design system](design-system.md)
- [D1 system context](diagrams/D1-system-context.md)
- [D2 use cases](diagrams/D2-use-case.md)
- [D3 architecture diagram](diagrams/D3-architecture.md)
- [D4 sequence](diagrams/D4-activity.md)
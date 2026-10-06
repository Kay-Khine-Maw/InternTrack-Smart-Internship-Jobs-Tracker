# InternTrack Feature List

## Purpose

This document describes the features of the whole system.

The specification defines requirements and acceptance criteria. The backlog records implementation and verification status.

## One Core Feature

**Capture, extract, review, save and reopen an internship.**

The Student provides a source, reviews the extracted draft, explicitly saves it and reopens the persisted record.

### F2 — Source Capture

- Priority: Must
- Backlog: B02
- Accept an internship URL or supported file.
- Support PDF, DOCX, PNG and JPG.
- Explain input limits and validation errors.

### F3 — Structured Extraction

- Priority: Must
- Backlog: B03
- Use Gemini to prepare structured internship information.
- Preserve missing or uncertain information.
- Show extraction failures clearly.

### F4 — Review and Correction

- Priority: Must
- Backlog: B04
- Show an editable draft before saving.
- Allow correction of supported fields.
- Require company and position.
- Allow cancellation without creating an internship.

Review is an AI safeguard. It is not a reported student pain point.

### F5 — Persistence and Reopening

- Priority: Must
- Backlog: B05
- Save reviewed information to PostgreSQL.
- Associate records with the authenticated Student.
- Preserve values after reload and application restart.
- Show success only after persistence succeeds.

### F6 — Duplicate Decisions

- Priority: Must
- Backlog: B06
- Check for possible duplicates within the Student's records.
- Offer view-existing, return and explicit override options.
- Enforce duplicate policy on the server.
- Do not save through an extraction-time warning.

## Authentication and Access

### F13 — Authentication and Session Access

- Priority: Must
- Backlog: B13
- Support sign-in and sign-out.
- Verify sessions on the server.
- Reject unauthorized or expired-session requests.
- Prevent access to another Student's records.
- Protect related documents, history and translations.

## Supporting Features

Supporting features extend the core workflow. Their priorities follow the specification.

### F1 — Profile Management

- Priority: Must
- Backlog: B10
- View and update supported profile information.
- Preserve intentionally cleared optional fields.
- Restrict access to the authorized Student.
- Show update failures clearly.

### F7 — Application Lifecycle

- Priority: Must
- Backlog: B01, B07
- Update application status and priority.
- Edit supported internship details and notes.
- Show consistent values across dashboard, list and detail views.

### F8 — Documents and Preparation

- Priority: Must
- Backlog: B08
- Add, rename, remove and complete checklist items.
- Show preparation progress.
- Save preparation notes separately from the description.

Checklist items track required materials. They do not imply storage of the actual application files.

### F9 — Dates and Calendar

- Priority: Must
- Backlog: B01, B09
- Track deadlines, follow-ups and interviews.
- Open an internship from its calendar event.
- Update supported dates and interview details.
- Show upcoming and overdue information.
- Provide computed in-app reminders.

In-app reminders do not imply email or push delivery.

### F10 — Search and Filtering

- Priority: Should
- Backlog: B20
- Search documented internship fields.
- Filter by status, priority and tags.
- Preserve list context after viewing a record.
- Show loading, error and empty-result states.
- Display only authorized records.

### F11 — English Translation

- Priority: Should
- Backlog: B11
- Use Gemini to translate supported fields into English.
- Keep original text accessible.
- Allow correction of translated information.
- Show field-level translation failures.

Research must confirm the required translation direction.

### F12 — Internship Deletion

- Priority: Should
- Backlog: B23
- Request explicit confirmation.
- Verify authorization on the server.
- Handle related data under retention rules.
- Update the interface only after successful deletion.

Deleting an internship is separate from a broader personal-data rights request.

## Shared Quality and Compliance Requirements

These requirements apply across features:

- Reliable loading, saving and failure handling.
- Input validation and safe source processing.
- Server-side authorization and secret protection.
- Correctable AI output and documented limitations.
- Accessible and responsive interfaces.
- Defined performance checks.
- Privacy notices and appropriate data handling.
- Retention, cleanup and applicable rights handling.
- Conditional traffic logging and acceptance-record controls.
- Traceable verification and human review.

References: NFR1–NFR8 and LR1–LR8 in the specification.

## Main Screens

- Sign-in.
- Dashboard.
- Internship list.
- Add Internship.
- Review form.
- Internship detail.
- Calendar.
- Profile.

The review form may be a state within Add Internship. Screen organization must match the user journey and design system.

## Shared Vocabulary

Primary actor: Student.

Application statuses:

`saved`, `preparing`, `applied`, `interview`, `accepted`, `rejected`.

Priorities:

`high`, `medium`, `low`.

## AI Boundaries

Gemini is the sole AI provider for extraction and translation.

AI output may be incomplete or incorrect. The Student must be able to review and correct it.

## Outside the Defined Product Scope

- Sharing records with other users.
- Employer or career-staff accounts.
- Outbound email or push notifications.
- Payments and subscriptions.
- Chat or messaging.
- Electronic signatures and contracts.
- Employer or university-system integrations.
- Long-term application-document hosting.
- Automated applications to employers.
- Analytics-based recommendations.
- Profile-driven AI personalization.

These features require a separate scope decision. They must not be presented as implemented capabilities.

## Related Documents

- [Specification](../01-requirements/spec.md)
- [Backlog](../01-requirements/backlog.md)
- [User journey](user-journey.md)
- [Architecture](architecture.md)
- [Design system](design-system.md)
- [D2 use cases](diagrams/D2-use-case.md)
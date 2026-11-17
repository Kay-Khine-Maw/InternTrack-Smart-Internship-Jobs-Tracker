# InternTrack Proposal

## Problem

Students managing several internship applications may have difficulty keeping information consistent across job boards, emails, documents, notes and spreadsheets.

The problem statements are:

- **P1:** Internship information is spread across multiple sources.
- **P2:** Manually copying internship details is repetitive and error-prone.
- **P3:** Deadlines and follow-ups are easy to miss when tracked separately.
- **P4:** Required application documents are not always tracked clearly.
- **P5:** Duplicate records make the application pipeline harder to manage.
- **P6:** Application progress, notes and preparation are not visible together.
- **P7:** Students may need English translations of non-English information.

## Target Users and Stakeholders

The primary application actor is the **Student**.

The project team and lecturer are stakeholders. Career-support staff may provide feedback, but staff accounts, employer accounts and record sharing are outside the Alpha scope.

## One Core Workflow

**Capture an internship source → extract information → review and correct the draft → explicitly save → reopen the persisted record.**

The workflow begins when the Student chooses Add Internship and ends when the reviewed record can be reopened with its saved values intact.

Core screens:

1. Dashboard or internship list.
2. Add Internship.
3. Review form.
4. Saved internship detail.

Loading, validation, duplicate, cancellation and failure states are part of the workflow.

## Proposed Solution

InternTrack prepares a structured draft from a URL or supported file.

The Student checks the draft against the source and corrects missing or inaccurate information before saving. AI output is assistance, not a guarantee of accuracy.

PostgreSQL stores the saved record. Supporting features help the Student manage status, priority, dates, documents, notes and application preparation.

## Objectives and Measurement

### Acceptance objective

Demonstrate a Student completing the core workflow in the running application.

Record evidence that:

- A supported source is processed.
- Extracted information is presented for review.
- A deliberate correction is retained.
- Saving requires an explicit final action.
- The saved values survive reload and reopening.

### Product evaluation measures

These are measurement plans, not reported results.

- **Task completion:** Number and proportion of participants completing the core task without assistance.
- **Entry time:** Time to create an accurate record manually compared with time through InternTrack using comparable sources.
- **Field correctness:** Selected saved fields compared with source information after review.
- **Persistence:** Saved values after reload and, separately, application restart.
- **Error recovery:** Whether participants understand failures and avoid believing an unsaved record was saved.

Participant numbers, quantitative improvement targets and test conditions must be agreed and recorded before evaluation. 

## Scope

### Core capabilities

- URL and supported PDF, DOCX, PNG or JPG intake.
- Structured extraction.
- Review and correction.
- Missing-field validation.
- Duplicate warning and explicit override.
- PostgreSQL persistence.
- Reopening the saved record.

### Supporting capabilities

- Dashboard and internship list.
- Status and priority.
- Deadlines, follow-ups and interview details.
- Document checklist and preparation notes.
- Calendar.
- Profile using synthetic data.
- English translation of supported fields.
- Computed in-app reminders.

### Explicit WON'T for the Alpha Demo

- Login, registration and authenticated multi-user tenancy.
- Sharing records.
- Outbound email or push notifications.
- Payments, subscriptions or messaging.
- Electronic signatures and contracts.
- Employer or university-system integrations.
- Long-term personal-document hosting.
- Analytics-based recommendations or profile-driven AI personalization.
- Unrestricted deployment with real student personal data.


## Main Flow

1. Student opens Add Internship.
2. Student provides a supported source.
3. System validates and processes the source.
4. Student reviews and corrects the draft.
5. Student explicitly selects Save.
6. Server validates the request and evaluates duplicate policy.
7. Student resolves any duplicate warning.
8. System confirms persistence and opens the saved record.
9. Student reloads or returns to the list and reopens it.

Alternative paths:

- Invalid input produces an actionable error.
- Extraction failure does not appear as success.
- Missing required fields prevent saving.
- An extraction-time duplicate warning does not itself save a record.
- Cancelling review creates no internship.
- A save failure does not appear as successful persistence.
- Extraction-history retention is governed separately from internship saving.

## Technical Approach

The application uses Next.js App Router, TypeScript, server routes, Prisma and PostgreSQL.

Website and document readers process internship sources, while Gemini provides structured information extraction and translation.

- Gemini is the sole AI provider.
- Image processing may follow a different path from text-document processing.
- AI-generated information is presented for student review and correction before saving.
- Provider failures must produce a clear error rather than appear successful.

Credentials, AI provider calls and database access remain server-side.

## Guardrails

- Verify demo fixtures and sources before calling them synthetic.
- Do not use real student profiles, resumes or application notes in the controlled Alpha.
- Minimize provider inputs.
- Treat external content and AI output as untrusted.
- Preserve explicit review and save.
- Keep failures and uncertainty visible.
- Do not disguise failed persistence with mock or localStorage records.
- Do not describe the demo user as authenticated isolation.
- Define demo-data cleanup.
- Record AI assistance and verification honestly.

## Risks

- Extraction quality varies by format, language and source.
- Providers may be unavailable or rate-limited.
- Persistence and mutation errors may leave misleading UI state.
- Shared demo identity does not isolate multiple users.
- Product assumptions are not yet supported by recorded validation.
- Supporting features may distract from stabilizing the core workflow.


## Responsibilities

Assign team members to:

- Product scope and validation.
- Design-system and diagram consistency.
- Implementation and setup.
- Verification and evidence.
- Privacy decisions and escalation of legal questions.

One person may hold multiple responsibilities. 

## Related Documents

- [Specification](01-requirements/spec.md)
- [Backlog](01-requirements/backlog.md)
- [Rules](../rule.md)
- [Agent guidance](../CLAUDE.md)
- [Feature list](02-design/feature-list.md)
- [Journey](02-design/user-journey.md)
- [Architecture](02-design/architecture.md)
- [Design system](02-design/design-system.md)
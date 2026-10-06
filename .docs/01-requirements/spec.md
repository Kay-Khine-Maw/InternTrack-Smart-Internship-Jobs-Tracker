# InternTrack Requirements Specification

## 1. Purpose 

This specification defines the intended behavior, quality requirements and data-handling requirements of InternTrack throughout its development and operation.

Document responsibilities:

- `proposal.md`: problem, users, objectives and product scope.
- `rule.md`: legal and compliance rules.
- This specification: system requirements and acceptance criteria.
- `backlog.md`: implementation tasks, priorities, dependencies and acceptance evidence.
- Design documents: user journeys, screens, components and system interactions.

## 2. Product Goal

InternTrack helps university students collect internship opportunities, review information extracted from source material, and manage their application records in one place.

The system supports a central workflow:

**Capture a source → extract information → review and correct → explicitly save → reopen the saved record.**

Supporting capabilities include profiles, application status, priority, document checklists, notes, dates, calendar views, search and translation.

## 3. Requirements Basis and Research Evidence

Requirements may originate from:

- Recorded student needs and observations.
- Product decisions.
- Legal and privacy obligations.
- Security, reliability and technical risks.

Review and correction remain required because InternTrack introduces AI-assisted extraction, which may produce incomplete or incorrect results. 

## 4. System Scope

### Included

- Student authentication and authorized access to personal records.
- Profile management.
- Internship capture from URLs and supported files.
- AI-assisted structured extraction.
- Review and correction before saving.
- Persistent internship records.
- Duplicate detection and deliberate override.
- Application status and priority management.
- Document checklists and preparation notes.
- Deadlines, follow-ups and interview information.
- Calendar and computed in-app reminders.
- Search and filtering.
- English translation of supported fields.
- Internship deletion and applicable personal-data handling.

### Outside the Defined Product Scope

The following require a separate scope decision:

- Sharing records with other users.
- Employer or career-staff accounts.
- Outbound email or push notifications.
- Payments and subscriptions.
- Chat or messaging.
- Electronic signatures and contracts.
- Employer or university-system integrations.
- Long-term hosting of resumes and application documents.
- Automated applications to employers.
- Analytics-based recommendations.
- Profile-driven AI personalization.

Supported uploads are inputs to the extraction workflow and remain subject to privacy and retention rules.

## 5. Actors and Components

### Application Actor

- **Student:** signs in, manages a profile, captures sources, reviews drafts and manages personal internship records.

### External Systems

- **Source Website:** supplies internship information through a URL.
- **Gemini:** provides structured extraction and translation.

### Internal Components and Inputs

- **Uploaded document:** an input artifact.
- **PostgreSQL:** persistent storage.
- **Server routes:** validation, authorization, processing and persistence.
- **Browser interface:** user interaction and presentation.

## 6. Shared Terminology

- **Source:** the webpage or file supplied for processing.
- **Draft:** extracted information that has not been saved as an internship.
- **Extraction history:** processing information retained separately from the internship record.
- **Saved record:** an internship successfully persisted by the server.
- **Document checklist:** required application materials represented as tasks.

Application statuses:

`saved`, `preparing`, `applied`, `interview`, `accepted`, `rejected`.

Priority values:

`high`, `medium`, `low`.

## 7. Functional Requirements

### F1 — Profile Management

**Priority: Must**

As a Student, I want to maintain my profile so that my academic and preparation information remains current.

Acceptance criteria:

- **F1-AC1:** The Student can load and save supported profile fields, including display name, academic information, contact information, preferences, skills and tools.
- **F1-AC2:** The system validates input and preserves intentionally cleared optional fields and lists.
- **F1-AC3:** Failed updates produce a clear error and are not presented as saved.
- **F1-AC4:** The server associates profile operations with the authenticated Student and rejects unauthorized access.

### F2 — Capture an Internship Source

**Priority: Must — Core workflow**

As a Student, I want to provide a URL or supported file so that I can start an internship draft from a posting.

Acceptance criteria:

- **F2-AC1:** The system accepts supported website URLs and PDF, DOCX, PNG and JPG files.
- **F2-AC2:** Unsupported, empty, malformed, unsafe or over-limit input produces an actionable error.
- **F2-AC3:** The source URL or filename is associated with the extraction where available, subject to retention rules.
- **F2-AC4:** Supported formats and input limits are documented and understandable to the Student.

### F3 — Extract and Normalize Information

**Priority: Must — Core workflow**

As a Student, I want source information converted into a structured draft so that I can review the internship details.

Acceptance criteria:

- **F3-AC1:** The draft supports company, position, location, deadline, description, requirements, required documents, application URL, contact information and skills where available.
- **F3-AC2:** Missing strings are represented consistently as null and missing lists as empty arrays. The system must not invent absent facts.
- **F3-AC3:** Identifiable dates are normalized consistently. Ambiguous or unavailable dates remain visibly unresolved.
- **F3-AC4:** Provider failures, invalid responses and unusable source content produce controlled errors.
- **F3-AC5:** Each claimed input format is verified and language limitations are documented.
- **F3-AC6:** Gemini receives only the source information necessary for the requested operation.

### F4 — Review and Correct

**Priority: Must — Core workflow**

As a Student, I want to inspect and correct the draft so that I control the information saved to my tracker.

Rationale: AI extraction may produce incomplete or incorrect results. Review is a system safeguard, not an assumed finding from student interviews.

Acceptance criteria:

- **F4-AC1:** The review screen displays extracted values and identifies missing information.
- **F4-AC2:** The Student can correct supported scalar and list fields before saving.
- **F4-AC3:** Company and position are required before saving.
- **F4-AC4:** Cancelling review creates no internship record.
- **F4-AC5:** Completing extraction or responding to an extraction-time duplicate warning does not automatically save a draft.
- **F4-AC6:** The Student must explicitly choose the final Save action after having the opportunity to review and correct the draft.

### F5 — Persist and Reopen

**Priority: Must — Core workflow**

As a Student, I want reviewed internship information saved reliably so that I can return to it later.

Acceptance criteria:

- **F5-AC1:** The system saves supported fields and valid source/history relationships under the authenticated Student.
- **F5-AC2:** New records default to `saved` status and `medium` priority when no other value is selected.
- **F5-AC3:** Reviewed values, including deliberate corrections, remain unchanged after reload and reopening.
- **F5-AC4:** Database failures are reported without false success. An unsuccessful operation must not leave an apparently complete record with incomplete related data.
- **F5-AC5:** Saved records remain available after an application restart.
- **F5-AC6:** Repeated submissions and retries must not create unintended duplicate records.

### F6 — Duplicate Detection and Decisions

**Priority: Must — Core workflow**

As a Student, I want duplicate warnings so that I can avoid accidentally saving the same opportunity more than once.

Acceptance criteria:

- **F6-AC1:** The system evaluates matching source/application URLs and its documented company/position matching policy within the Student’s records.
- **F6-AC2:** Duplicate policy is enforced on the server.
- **F6-AC3:** A warning offers a route to the existing record, a return/cancel option and an explicit override.
- **F6-AC4:** An override authorizes only the intended save attempt. An extraction-time warning returns to review without saving.
- **F6-AC5:** The matching policy and its limitations are documented and tested.
- **F6-AC6:** Duplicate responses must not reveal another Student’s records.

### F7 — Application Lifecycle

**Priority: Must**

As a Student, I want to update application status and priority so that my pipeline reflects my progress.

Acceptance criteria:

- **F7-AC1:** The system supports the defined status and priority values.
- **F7-AC2:** Changes persist and appear consistently in detail, list and dashboard views.
- **F7-AC3:** Failed updates produce a clear error and preserve a recoverable interface state.
- **F7-AC4:** The Student can update supported internship details and notes without creating a replacement record.

### F8 — Documents and Preparation

**Priority: Must**

As a Student, I want a checklist and preparation notes so that I can track what remains to be completed.

Acceptance criteria:

- **F8-AC1:** Checklist items can be added, renamed, removed and marked complete.
- **F8-AC2:** Checklist progress is visible, and preparation notes are stored separately from the internship description.
- **F8-AC3:** The server verifies that each changed checklist item belongs to the intended internship and Student.
- **F8-AC4:** Failed changes are shown without implying completion.

### F9 — Dates and Calendar

**Priority: Must**

As a Student, I want relevant application dates visible together so that I can plan my next actions.

Acceptance criteria:

- **F9-AC1:** The calendar displays deadline, follow-up and interview events.
- **F9-AC2:** Selecting an event opens its related internship.
- **F9-AC3:** Supported deadlines, follow-up dates and interview date/time/link information can be updated.
- **F9-AC4:** Upcoming and overdue information is calculated and displayed consistently using a documented date/time interpretation.
- **F9-AC5:** Computed in-app reminders are clearly distinguished from outbound email or push notifications.

### F10 — Search and List Context

**Priority: Should**

As a Student, I want to search and filter my pipeline so that I can find relevant records.

Acceptance criteria:

- **F10-AC1:** The list supports status, priority and tag filtering, plus search over documented internship fields.
- **F10-AC2:** Opening a record and returning preserves the previous search and filter context.
- **F10-AC3:** Loading, failure and empty-result states are understandable.
- **F10-AC4:** Searching and filtering do not modify saved records.
- **F10-AC5:** Results include only records the Student is authorized to access.

### F11 — English Translation

**Priority: Should**

As a Student, I want supported information translated into English so that I can review non-English postings.

Acceptance criteria:

- **F11-AC1:** Gemini translates supported scalar and list fields.
- **F11-AC2:** Original information remains accessible and translated values can be corrected.
- **F11-AC3:** Translation failure is shown at the relevant field without blocking unrelated editing.
- **F11-AC4:** Stored translations have a valid association with the relevant draft or internship and follow its access and retention rules.
- **F11-AC5:** The interface does not imply that translation guarantees factual accuracy.

### F12 — Delete an Internship

**Priority: Should**

As a Student, I want to remove an internship so that my pipeline remains current.

Acceptance criteria:

- **F12-AC1:** Deletion requires an explicit confirmation.
- **F12-AC2:** The server verifies the Student’s authorization before deletion.
- **F12-AC3:** Related data is removed or retained according to documented relationship and retention rules.
- **F12-AC4:** The interface removes the record or navigates away only after confirmed success.
- **F12-AC5:** Failed deletion produces a clear error.

### F13 — Authentication and Session Access

**Priority: Must**

As a Student, I want secure access to my account so that other people cannot access or change my records.

Acceptance criteria:

- **F13-AC1:** The system provides sign-in and sign-out through the selected authentication method.
- **F13-AC2:** The server derives identity from a verified session, not a client-supplied user identifier.
- **F13-AC3:** Protected operations reject missing, invalid or expired sessions.
- **F13-AC4:** The server prevents one Student from accessing or changing another Student’s profiles, internships, checklist items, extraction history and translations.
- **F13-AC5:** Signing out invalidates the relevant session so it cannot continue authorizing protected operations.
- **F13-AC6:** The selected authentication approach documents account enrollment, session expiry and recovery behavior where applicable.

## 8. Non-Functional Requirements

### NFR1 — Reliability

- Asynchronous loading, extraction, translation, creation, updates and deletion must expose appropriate progress and failure states.
- A failed persistence request must not appear successful.
- Verification must include provider failure, database failure, repeated submission and relevant multi-step write failures.
- Saved records must remain available after reload and application restart.

### NFR2 — Validation

- Malformed or invalid client input must produce a deliberate 4xx response and a safe message.
- Unexpected errors must not expose secrets or stack traces.
- Validate file types and limits, field types, dates, record references and URL destinations.
- URL processing must prevent unintended access to internal/private services, including through redirects where relevant.

### NFR3 — Security

- Database access and provider credentials must remain server-side.
- Protected operations must use verified identity and server-side authorization.
- Authorization must cover related resources, not only the main internship record.
- Verification must include unauthenticated requests and attempts to access another Student’s records.
- Real credentials must not be committed or exposed in logs, client code or errors.

### NFR4 — Data Quality

- Missing information must remain distinguishable from confirmed information.
- The system must not silently invent source facts.
- Saveable extracted information must be reviewable and correctable.
- Test representative missing, ambiguous and incorrect fields across claimed formats and languages.
- Do not equate model confidence or field completeness with accuracy.

### NFR5 — Accessibility

- The core workflow must be usable with a keyboard.
- Interactive controls must have accessible names and visible focus.
- Validation messages must identify the affected input.
- Dialogs must support appropriate focus entry, navigation and return.
- Status and error meaning must not depend on color alone.

### NFR6 — Responsiveness

- Dashboard, list, detail, capture, review, profile and calendar screens must remain usable on narrow and wide viewports.
- Initial verification must include 375 px and 1440 px viewport widths.
- Application layout must not cause unintended page-level horizontal scrolling.
- Required actions and messages must remain accessible at the tested sizes.

### NFR7 — Performance

- Target a loaded list state within two seconds after a successful API response is available under the documented test conditions.
- Record browser/device, dataset size and relevant environment details.
- Measure API response time separately; the UI target is not an end-to-end response-time guarantee.
- Extraction and translation must show progress and a clear failure or timeout outcome.
- Additional production response-time targets must be recorded when the expected workload and hosting environment are defined.

### NFR8 — Maintainability and Verification

- Significant changes must link requirements, plan, implementation, verification and human review.
- Schema changes must use migrations.
- Shared vocabulary and API contracts must remain consistent.
- Changed behavior requires relevant automated checks or a documented manual verification method.
- Missing checks or unresolved failures must be reported rather than presented as success.

## 9. Legal and Compliance Requirements

Detailed instructions are defined in `rule.md`. References below use section names because the current rule document does not use numbered rule IDs.

### LR1 — Purpose and Minimization

Personal-data processing must have a documented purpose, appropriate lawful-basis assessment, minimum necessary data scope and relevant notice. Where consent is used, its collection and withdrawal must follow the applicable rules.

Reference: `rule.md` — PDPA.

### LR2 — External AI Processing

Information sent to Gemini must be limited to what is necessary. Relevant processor, transfer, disclosure and retention decisions must be addressed before personal data is transmitted.

Reference: `rule.md` — PDPA.

### LR3 — Uploaded Documents

Uploaded files and extracted personal content must remain private, access-controlled and limited to the approved processing purpose.

Reference: `rule.md` — PDPA.

### LR4 — Ownership and Personal-Data Rights

The system must enforce authorization and provide a process for applicable personal-data rights requests, with appropriate identity verification and documented exceptions.

Rights handling must not depend solely on whether a person has an application account.

Reference: `rule.md` — PDPA.

### LR5 — Secrets and Safe Handling

Credentials and unnecessary personal content must not appear in source control, ordinary logs, errors or telemetry. Suspected exposures must be escalated to the responsible person.

Reference: `rule.md` — PDPA and Computer Crime Act §26.

### LR6 — Traffic Records

The operator must assess applicable traffic-record obligations and implement the required metadata, retention, protection and authorized disclosure processes.

Traffic logs are separate from uploaded content and extraction history.

Reference: `rule.md` — Computer Crime Act §26.

### LR7 — Electronic Acceptance and Signatures

If electronic acceptance or signature functionality is introduced, assess the required identity, intention, integrity and reliability evidence.

Signature and certificate functionality are outside the currently defined product scope.

Reference: `rule.md` — Electronic Transactions Act §9 / §26 / §28.

### LR8 — Retention and Deletion

Define retention and cleanup for personal and derived data, including successful, failed, cancelled and orphaned extraction records.

Document justified retention exceptions and the treatment of related data when an internship or account is removed.

Reference: `rule.md` — PDPA and, where relevant, Computer Crime Act §26.

## 10. Verification and Acceptance

The backlog must link each requirement to implementation work and verification evidence.

Evidence must identify:

- Requirement and acceptance-criterion ID.
- Tested application version.
- Test source or fixture.
- Test conditions and steps.
- Expected result.
- Actual result.
- Remaining limitations.
- Reviewer and review date.
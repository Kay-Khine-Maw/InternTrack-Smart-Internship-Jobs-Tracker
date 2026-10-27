# InternTrack User Journey

## Scope

Actor: Student.

Core journey:

Capture → extract → review and correct → explicitly save → reopen.

Supporting journeys cover profile management, application tracking, search, translation and deletion.

This document describes intended system behavior. The backlog records implementation gaps and acceptance status.

## Preconditions

- The application and database are available.
- The Student has an account through the selected enrollment process.
- Protected actions require a valid authenticated session.
- Gemini is configured for extraction and translation.
- Relevant data-handling information is available to the Student.

## J0 — Sign In

The Student signs in through the selected authentication method.

- Trace: F13; B13.
- Successful authentication opens the application.
- Failed authentication shows a clear error.
- Protected requests require a verified server-side session.
- The Student can access only authorized records.

The authentication route is defined during implementation.

## J1 — Start

The Student opens the dashboard or internship list and chooses Add Internship.

- Screen: `/dashboard` or `/internships`.
- Trace: F2; B02.
- Show a visible Add Internship action.
- Provide loading, empty and error states.

## J2 — Provide a Source

The Student pastes an internship URL or selects a supported file.

- Screen: `/add-internship`.
- Trace: F2-AC1–F2-AC4; B02.
- Supported files: PDF, DOCX, PNG and JPG.
- Explain supported formats and input limits.
- Reject invalid, unsupported, unsafe or over-limit input.
- Keep the source reference where available.

The Student can correct the input or cancel.

## J3 — Extract Information

The system processes the source and uses Gemini to prepare a structured draft.

- Trace: F3-AC1–F3-AC6; B03.
- Show processing progress.
- Send only necessary content to Gemini.
- Keep missing information visibly unresolved.
- Do not invent absent facts.
- Show an actionable error if processing fails.

The Student can retry or cancel after a failure. Successful extraction does not mean an internship has been saved.

## J4 — Review and Correct

The Student compares the draft with the source and edits its values.

- Trace: F4-AC1–F4-AC6; B04.
- Display extracted and missing information.
- Allow correction of supported fields and lists.
- Require company and position before saving.
- Keep the final Save action explicit.
- Cancelling creates no internship record.

Review reduces the risk of saving incorrect AI output. It does not guarantee accuracy.

If an extraction-time duplicate warning appears, the Student can view the existing record or return to review. The warning must not save the draft.

### Optional Translation

The Student may translate supported fields into English.

- Trace: F11; B11.
- Use Gemini for translation.
- Keep the original text accessible.
- Allow correction of translated values.
- Show translation failures without blocking other edits.

## J5 — Save and Resolve Duplicates

The Student explicitly selects Save after reviewing the draft.

- Trace: F5, F6; B05, B06.
- Validate the request on the server.
- Verify ownership and related-record references.
- Evaluate duplicate policy within the Student's records.

The main decision is:

**Does the system identify a possible duplicate?**

- **No:** attempt to save the reviewed record.
- **Yes:** let the Student view the existing record, return to review or explicitly override the warning.

An override applies only to the intended save attempt. It must not reveal another Student's records.

Invalid requests return to review with an actionable error.

## J6 — Confirm and Reopen

After confirmed persistence, the system opens the saved detail.

The Student reloads or returns to the list and reopens the record.

- Screen: `/internships/[id]`.
- Trace: F5-AC1–F5-AC6; B05.
- Preserve the reviewed values and deliberate corrections.
- Keep saved records available across application restarts.
- Prevent unintended copies from repeated submissions.
- Show read or save failures clearly.

A failed save must not appear successful. Retained extraction history follows LR8 independently.

## Supporting Journey — Manage Profile

The Student opens the profile and updates preparation information.

- Screen: `/profile`.
- Trace: F1; B10.
- Load only the authorized profile.
- Validate changes before saving.
- Preserve intentionally cleared optional fields.
- Confirm success only after persistence.
- Show failed updates clearly.
- Upload a PDF or DOCX resume, review proposed extracted values, then explicitly apply them.
- Resume files are processed temporarily and are not retained by default.

## Supporting Journey — Track an Application

The Student opens a saved internship and updates its progress.

- Screen: `/internships/[id]`.
- Trace: F7, F8; B07, B08.
- Update priority and supported record details; application-status tracking is deferred.
- Add preparation notes.
- Add, rename, remove and complete checklist items.
- Show consistent saved values across relevant views.
- Keep failed changes recoverable.

Supported priorities:

`high`, `medium`, `low`.

Checklist items track preparation. They do not imply storage of the actual application documents.

## Supporting Journey — Review Dates

The Student checks deadlines, follow-ups and interviews.

- Screen: `/calendar` or `/dashboard`.
- Trace: F9; B01, B09.
- Display relevant application dates.
- Open the related internship from an event.
- Allow supported date and interview-detail updates.
- Show upcoming and overdue information consistently.

Computed in-app reminders do not imply outbound email or push notifications.

## Supporting Journey — Search and Filter

The Student searches or filters the internship list.

- Screen: `/internships`.
- Trace: F10; B20.
- Support status, priority, tags and documented search fields.
- Show only authorized records.
- Preserve search and filter context after viewing a record.
- Explain empty results.
- Do not modify records when filtering.

## Supporting Journey — Delete an Internship

The Student chooses to remove a saved internship.

- Trace: F12, LR8; B23.
- Request explicit confirmation.
- Verify authorization on the server.
- Handle related data according to retention rules.
- Remove the record from the interface after confirmed success.
- Keep the record visible with an error if deletion fails.

Deleting an internship is distinct from a broader personal-data rights request.

## Supporting Journey — Personal-Data Requests

The person requests applicable access, correction or deletion.

- Trace: LR4, LR8; B14.
- Explain how to submit the request.
- Verify identity appropriately.
- Handle relevant source and derived data.
- Explain applicable exceptions and retained information.

The request process need not depend on having an active account.

## Related Documents

- [Specification](../01-requirements/spec.md)
- [Backlog](../01-requirements/backlog.md)
- [Feature list](feature-list.md)
- [Design system](design-system.md)
- [Prototype](prototype/README.md)
- [D4 sequence](diagrams/D4-activity.md)
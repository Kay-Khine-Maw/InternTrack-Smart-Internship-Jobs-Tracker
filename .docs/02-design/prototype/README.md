# InternTrack Prototype

## Purpose

The prototype describes the intended user experience of the whole system.

It covers the core workflow and supporting screens.
Prototype interactions do not prove working authentication,
AI processing or database persistence.

Implementation and verification status remain in the backlog.

## Prototype Link

[Open the Figma prototype](https://www.figma.com/make/CHGXQRRC6fiLTbwoueLiEe/InternTrack-web-app?t=jzakXBG54WLjMRPG-20&fullscreen=1)

Check access and screen coverage before sharing.
The screen descriptions below are requirements for alignment, not confirmation that every Figma screen has been updated.

## Core Workflow

Sign in → capture a source → extract → review and correct → explicitly save → reopen.

The Student remains in control of the final saved information.

## Main Screens

### 1. Sign-In

- Provide access through the selected authentication method.
- Show authentication errors clearly.
- Explain session expiry and allow sign-in again.

Trace: F13; B13.

A prototype sign-in screen does not establish real authentication.

### 2. Dashboard

- Show application totals and relevant upcoming actions.
- Provide a clear Add Internship action.
- Allow access to saved records.
- Include loading, empty and error states.

Trace: F7, F9; B01.

### 3. Internship List

- Display authorized internship records.
- Support search and status, priority and tag filters.
- Open the selected record.
- Preserve list context when returning.
- Explain empty search results.

Trace: F5, F10; B05, B20.

### 4. Add Internship

- Accept a URL or supported PDF, DOCX, PNG or JPG file.
- Explain supported formats and limits.
- Show processing progress.
- Provide clear validation and extraction errors.

Trace: F2, F3; B02, B03.

### 5. Review and Correct

- Display the extracted draft.
- Identify missing information.
- Allow supported fields and lists to be edited.
- Require company and position before saving.
- Offer optional English translation through Gemini.
- Keep original text accessible.
- Provide explicit Save and Cancel actions.

Trace: F4, F11; B04, B11.

The review form may be a state within Add Internship.

### 6. Duplicate Decision

- Explain that a possible duplicate exists.
- Offer View Existing and Return to Review.
- Allow an explicit override during a save attempt.
- Do not save through an extraction-time warning.

Trace: F6; B06.

### 7. Internship Detail

- Display the saved information.
- Allow supported record edits.
- Manage status and priority.
- Manage checklist items and preparation notes.
- Update dates and interview details.
- Request confirmation before deletion.
- Show mutation failures clearly.

Trace: F5, F7, F8, F9, F12; B05, B07, B08, B09, B23.

### 8. Calendar

- Show deadlines, follow-ups and interviews.
- Open the related internship from an event.
- Distinguish event types clearly.
- Remain usable on smaller screens.

Trace: F9; B09.

### 9. Profile

- Display and edit supported profile information.
- Allow optional fields to be cleared.
- Show validation and save outcomes.
- Restrict access to the authorized Student.

Trace: F1; B10.

Profile information is not automatically used to personalize extraction.

## Supporting Interactions

- Translate supported fields while preserving the original.
- Review computed in-app reminders.
- Confirm or cancel deletion.
- Sign out.
- Recover from an expired session.

In-app reminders do not imply email or push delivery.

## Required UI States

The prototype should represent:

- Loading and processing.
- Empty content.
- Invalid input.
- Missing extracted information.
- Provider failure.
- Editable draft.
- Duplicate warning.
- Cancelled review.
- Saving and confirmed success.
- Save or deletion failure.
- Expired session or denied access.

Do not show a failed operation as successful.

## Design Consistency

Follow the shared design system for:

- Colors and typography.
- Spacing and layout.
- Buttons, inputs and dialogs.
- Status and priority badges.
- Keyboard focus and accessibility.
- Responsive behavior.

Use the same terminology as the specification.

Statuses:

`saved`, `preparing`, `applied`, `interview`, `accepted`, `rejected`.

Priorities:

`high`, `medium`, `low`.

## Suggested Walkthrough

1. Sign in.
2. Open Add Internship.
3. Provide a supported source.
4. Review the extracted draft.
5. Correct at least one field.
6. Explicitly save.
7. Reopen the record.
8. Update status or a checklist item.
9. Review a calendar event.
10. Sign out.

Prototype navigation illustrates the intended flow.
Persistence and authorization require testing in the running application.

## Scope Boundaries

The current scope excludes:

- Sharing and employer/staff accounts.
- Outbound email or push notifications.
- Payments and messaging.
- Electronic signatures.
- Automated job applications.
- Analytics-based recommendations.
- Profile-driven AI personalization.

Label any future concept screens clearly.

## Review and Evidence

Record:

- Prototype version or review date.
- Screens and interactions reviewed.
- Related requirement IDs.
- Design-system differences.
- Usability findings.
- Remaining gaps.

Track usability findings in B21.
Track accessibility and responsive findings in B25.

## Related Documents

- [Specification](../../01-requirements/spec.md)
- [Backlog](../../01-requirements/backlog.md)
- [Feature list](../feature-list.md)
- [User journey](../user-journey.md)
- [Architecture](../architecture.md)
- [Design system](../design-system.md)
- [D2 use cases](../diagrams/D2-use-case.md)
- [D4 activity](../diagrams/D4-activity.md)
# InternTrack Design System

## Purpose

This document defines shared UI rules for the whole system.

It applies to sign-in, dashboard, internship list, capture/review, internship detail, calendar and profile screens.

Implementation and verification status are recorded in the backlog.

## Design Sources

Use the shared styling and components defined in:

- `web/tailwind.config.ts`
- `web/app/globals.css`
- `web/components/ui/`
- `web/components/layout/`
- `web/components/internships/`

Update this document when shared design decisions change.

## Colors

Existing brand tokens:

- Navy: `#152048`
- Navy light: `#F4F6FB`
- Accent: `#5B5CE6`
- Accent soft: `#EEF0FF`
- Accent deep: `#4F46E5`

Use semantic tokens for backgrounds, text, borders, focus and errors.

Reuse existing colors across screens. Do not communicate meaning through color alone.

## Typography and Spacing

- Use the configured Geist Sans font.
- Keep a clear heading, label and body-text hierarchy.
- Use shared Tailwind spacing utilities.
- Keep spacing consistent within forms and between sections.
- Allow long text to wrap without hiding important content.

## Layout

- Use the shared application shell for signed-in screens.
- Keep navigation consistent.
- Collapse navigation when space is limited.
- Use a simpler layout for sign-in where appropriate.
- Avoid unintended horizontal scrolling.
- Keep actions and messages accessible on small screens.

## Shared Components

Reuse existing components for:

- Buttons and form controls.
- Cards and lists.
- Dialogs.
- Status and priority badges.
- Loading and feedback states.

Use primary styling for the main action.
Use destructive styling for deletion.
Give icon-only controls accessible names.

## Forms

- Provide visible field labels.
- Identify required fields and input limits.
- Show errors beside the relevant input.
- Preserve entered values after recoverable failures.
- Allow optional fields to be cleared.
- Prevent accidental repeated submissions.
- Show success only after server confirmation.

## Status and Priority

Application status values and status badge color families are deferred.
The current build does not expose application-status controls or require
status badges. The previously proposed values (`saved`, `preparing`,
`applied`, `interview`, `accepted`, `rejected`) and their color assignments
should not be treated as implemented UI.

Priorities:

`high`, `medium`, `low`.

Reuse shared badge components and always display text labels.

## AI Review and Translation

- Present extracted information as an editable draft.
- Identify missing information clearly.
- Keep original text available when translating.
- Show extraction and translation failures.
- Require an explicit final Save action.
- Do not let an extraction-time duplicate warning save a draft.
- Do not present AI output as guaranteed accurate.

## Feedback and Dialogs

Provide clear states for:

- Loading.
- Empty content or search results.
- Validation errors.
- Processing or persistence failures.
- Confirmed success.
- Expired sessions or denied access.

Dialogs must have clear titles and action labels. Destructive actions require confirmation.

Keep focus visible and return it appropriately when a dialog closes.

## Dates and Calendar

- Use consistent date and time formatting.
- Follow the documented timezone behavior.
- Distinguish deadlines, follow-ups and interviews.
- Make events open their related records.
- Keep calendar controls usable on smaller screens.

## Accessibility and Motion

- Support keyboard navigation.
- Give controls accessible names.
- Keep text readable and focus visible.
- Check color contrast.
- Do not rely only on color, hover or animation.
- Keep motion brief and respect reduced-motion preferences.

## Design Verification

Check affected screens for:

- Consistent tokens and components.
- Clear actions and complete feedback states.
- Keyboard and dialog behavior.
- Responsive layouts at 375 px and 1440 px.
- Agreement with the specification and user journey.

Record usability findings in B21. Record accessibility and responsive findings in B25.

## Related Documents

- [Specification](../01-requirements/spec.md)
- [Backlog](../01-requirements/backlog.md)
- [Feature list](feature-list.md)
- [User journey](user-journey.md)
- [Architecture](architecture.md)
- [Prototype](prototype/README.md)
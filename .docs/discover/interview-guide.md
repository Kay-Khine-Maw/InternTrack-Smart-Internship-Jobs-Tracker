# Moderated User-Test Interview Guide

## Purpose

The primary purpose of each session is to let a student test InternTrack while
the team observes usability, completion, errors and trust. The interview
questions provide context before the test and explanations after the test; they
are not the main activity.

Run exactly five sessions with real users, coded **U01, U02, U03, U04 and U05**.
Do not treat this guide as evidence that sessions have already happened.

## Participants

- Five students who have searched for, applied to or seriously considered an
  internship.
- Prefer a mix of study years, broad fields and internship-search experience.
- Do not require grades, passwords, private documents or employer-confidential
  information.

## Session duration

- Introduction, consent and setup: 5 minutes
- Pre-test current-method questions: 5 minutes
- InternTrack task test: 20–25 minutes
- Post-test interview: 7 minutes
- SUS/TAM/UTAUT2 questionnaires: 5–8 minutes

Target duration: **40–50 minutes per participant**.

## Moderator rules

1. Assign the next code: U01 through U05.
2. Use the same synthetic internship posting and student scenario for all five
   sessions.
3. Read task instructions exactly; do not demonstrate the solution first.
4. Ask the participant to think aloud, but do not coach or assist.
5. If the participant is blocked, record the blockage and allow the task to
   continue or fail without giving a hint, navigation instruction or solution.
6. Record time, completion, errors, assistance and notable observations.
7. Never ask for a password, real resume, private application or sensitive
   personal data.
8. Obtain separate consent for note-taking and recording.
9. Stop immediately if the participant becomes uncomfortable.

The test is **unassisted**. The moderator may read the written task once, answer
questions about consent or recording, and report technical problems, but must
not explain what to click, identify fields, correct mistakes or suggest the next
step. Any moderator intervention must be recorded and the task must not be
counted as independently completed.

## Opening and consent script

> We are evaluating InternTrack, not evaluating you. We want to see whether the
> product is understandable and useful. Please attempt the tasks as you
> naturally would. There are no right answers. You may skip any question or
> stop at any time. We will use the code [U##] instead of your name and will
> use a synthetic internship scenario. May we take notes? May we record audio
> or screen activity?

Record:

- Participant code:
- Date and time:
- Moderator:
- Note-taking consent: Yes / No
- Recording consent: Yes / No
- Broad study field:
- Study year:
- Previous internship-search experience:

## Part 1 — Pre-test questions

Ask these before showing InternTrack:

1. Tell me about the last internship opportunity you seriously considered.
2. Where did you find it?
3. How would you normally save the link and important details?
4. How would you track deadlines, follow-ups or interviews?
5. What is usually the most difficult or error-prone part?

## Part 2 — Before-condition baseline

Use the same synthetic posting that will be used in the InternTrack condition.
Give the participant a blank note or spreadsheet, but do not provide a
structured template.

Say:

> Using your usual method, find and record the company, position, location,
> deadline, requirements and application link from this posting. Then explain
> how you would keep it for later.

Record:

- Start time:
- End time:
- Completion: Independent / Failed / Invalidated by intervention
- Number of moderator interventions:
- Participant questions:

## Part 3 — InternTrack task test

Reset to a clean test account before each participant.

### Task T1 — Sign in and start capture

> Sign in using the provided test account and open the Add Internship flow.

Record session start, sign-in errors and assistance.

### Task T2 — Capture and extract

> Submit the provided synthetic internship URL or document. Wait for the
> extraction result and tell me what you think the system has produced.

Observe loading, errors, source handling and whether the participant understands
that extraction creates a draft rather than a saved record.

### Task T3 — Review and correct

> Compare the draft with the source. Correct the intentionally incomplete or
> inaccurate field, check the requirements and documents, and choose a priority.

Do not tell the participant which field is intentionally wrong. Record whether
they notice it, what they correct and whether missing information is treated as
missing rather than invented. Do not identify the field if they ask for help.

### Task T4 — Explicit save and reopen

> Save the reviewed internship. Reopen it from the list or dashboard, refresh
> the page, and confirm that your correction and priority remain.

Record whether the participant understands the Save action, persistence result,
reload behavior and any error.

### Task T5 — Duplicate decision

> Submit the same source again. Explain what you would do when the duplicate
> warning appears, then choose the appropriate return, view-existing or
> explicit-override path.

Do not allow an accidental duplicate to remain in the test account after the
session. Record whether the warning is understood and whether the participant
can make a deliberate decision. Do not tell them which option to choose.

### Optional supporting tasks

If time allows, test one or more of profile, document checklist, calendar,
search/filter or translation. These do not replace T1–T5.

## Part 4 — Post-test interview

Ask after the participant completes the tasks:

1. What was easiest?
2. What was confusing or slower than expected?
3. Did the extracted draft look trustworthy? Why or why not?
4. Did the review-before-save and duplicate-warning flows give you enough
   control?
5. Compared with your usual method, what improved and what became worse?

Do not ask leading questions such as “Was the design clear?” Prefer “What did
you expect to happen here?”

## Part 5 — Questionnaires

Administer the approved SUS, TAM and UTAUT2 forms after the tasks and before
the final thank-you. Record responses using the participant code only.

- [SUS response template](../test/sus-results.md)
- [TAM response template](../test/tam-results.md)
- [UTAUT2 response template](../test/utaut2-results.md)

## Per-session evidence record

Complete [session-log.md](../test/session-log.md) immediately after each
session. Record:

- Before and after task times.
- Completion state for T1–T5.
- Critical and non-critical errors.
- Moderator interventions.
- Missing or incorrect fields.
- Duplicate decision.
- Participant comments.
- Questionnaire response references.
- Data deletion/retention action.

## Analysis after U05

1. Remove names and identifying details.
2. Summarize each session before comparing participants.
3. Calculate before/after results using the same definitions and fixtures.
4. Report raw values, medians, completion rates, errors and assistance.
5. Cluster repeated usability problems and contradictory feedback.
6. Separate observed behavior from participant opinion.
7. Map findings to P1–P8, F1–F14 and backlog items.
8. Update the comparison table, case study, issue log and presentation.
9. Store only permitted anonymized evidence in the repository.

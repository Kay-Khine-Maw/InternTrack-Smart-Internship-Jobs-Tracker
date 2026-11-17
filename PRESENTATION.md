# InternTrack Presentation Pack

## Assessment information

- **Date:** Wednesday 18 November 2026
- **Room:** SE Lab
- **Time:** 08:30–16:10; use the team's timetable for the exact slot
- **Format:** 10-minute presentation, 3-minute Q&A, 2-minute changeover
- **Team:** Nexus
- **Arrival:** At least 15 minutes before the slot

## Important rule for evidence

Do not invent numbers. Every number shown on a slide must have a source in the
speaker notes or in this file. The focused checks currently pass, but the
repository still has TypeScript/build failures that must be fixed before claiming
the application is fully presentation-ready.

Current verification evidence:

- `npm run lint` passed, with three image-optimization warnings.
- `npm run test:duplicates` passed seven focused duplicate/empty-field scenarios.
- `npm run test:extract` passed with exit code 0.
- `npm run test:matching` passed matching and resume-validation checks.
- `npx prisma validate` passed.
- `npx tsc --noEmit` currently fails.
- `npm run build` currently fails during type checking.
- `npm audit --omit=dev` currently reports six production vulnerabilities.
- Five anonymized U01–U05 interview responses are recorded. They provide
  qualitative evidence only; task timings, completion rates and questionnaire
  scores are still pending.

Sources:

- [web/package.json](web/package.json)
- [web/scripts/verify-duplicates.ts](web/scripts/verify-duplicates.ts)
- [web/scripts/verify-extract.ts](web/scripts/verify-extract.ts)
- [web/scripts/verify-matching.ts](web/scripts/verify-matching.ts)
- [.docs/discover/interview-transcripts.md](.docs/discover/interview-transcripts.md)
- [.docs/01-requirements/spec.md](.docs/01-requirements/spec.md)
- [.docs/01-requirements/backlog.md](.docs/01-requirements/backlog.md)

## Presentation objective

Show one complete, working journey:

> Capture → extract → review and correct → explicitly save → reopen.

The demo must prioritize the Must requirements:

1. Authenticated access.
2. Capture from a URL or supported file.
3. Structured extraction.
4. Review and correction before saving.
5. Explicit save and reopen.
6. Duplicate warning and explicit override decision.

Do not spend presentation time on deferred application-status tracking, outbound
notifications, sharing, or unsupported capabilities.

## Ten-minute running order

| Time | Speaker | Section | Evidence/demo |
|---|---|---|---|
| 0:00–0:45 | Nang | Problem, users, product promise | Student workflow |
| 0:45–1:45 | Pyae | Design and review experience | Add/review interface |
| 1:45–2:45 | Kay | Technical architecture and ownership | Server route/database flow |
| 2:45–6:45 | Nang, Nway, Kay, Thura | Live Must-task demo | Real running application |
| 6:45–8:15 | Thura | Test results and comparison evidence | Test scripts/output |
| 8:15–9:15 | Nway | AI logic and proof | Gemini, normalization, review gate |
| 9:15–10:00 | All, led by Nang | Roles, lessons, disclosure, close | Team contribution summary |

Use a visible timer. The presentation stops at 10:00 even if a demo step is
unfinished.

## Full speaking scripts

### Nang Yu Yu Khay — Product Owner

**Opening — 45 seconds**

> Hello, we are Nexus, and our product is InternTrack. Our users are students
> who collect internship opportunities from job boards, documents and messages.
> The problem is not only finding a posting; it is keeping the important details
> accurate and usable after finding it. InternTrack turns one source into a
> reviewable internship record. Our core promise is: capture, extract, review,
> correct, explicitly save, and reopen.

> We will demonstrate the Must workflow using a real running application. We
> will not treat AI output as trusted data: the student remains responsible for
> correcting the draft before saving.

**Demo hand-off — 30 seconds**

> I will start with the student journey. First I sign in, then submit a real
> internship source. Nway will explain what the AI does while the draft is
> generated. Pyae will point out the review interaction, Kay will show the
> authenticated persistence boundary, and Thura will verify the duplicate and
> test behavior.

**Close — 30 seconds**

> InternTrack is deliberately focused. We support the student's own pipeline,
> priorities, documents, dates and profile. Application-status tracking is
> deferred, and we do not claim email reminders, sharing or automatic
> applications. Each member can answer for the part they built or tested.

### Pyae Shunn Le Maung — Designer

**Design explanation — 1 minute**

> I designed the flow around the highest-risk moment: the gap between AI
> extraction and a saved record. The review screen makes extracted fields
> editable, shows missing information instead of hiding it, and keeps Save as an
> explicit action. Company and position are required before a record can be
> saved. The interface also exposes loading, error, empty and correction states.

> The main screens are sign-in, dashboard, internship list, add/review,
> internship detail, calendar and profile. The visual system uses shared
> buttons, inputs, cards, dialogs and priority components so the same actions
> remain recognizable across screens.

**During demo — 30 seconds**

> Here the extraction has produced a draft, not a saved internship. I can
> correct the company, position, deadline, requirements, documents, priority
> and notes. If I cancel now, no internship record should be created. Only the
> explicit Save action moves the reviewed draft into the pipeline.

**Q&A preparation**

- Explain why the review step is a product safeguard, not just a visual screen.
- Explain how loading and failure states prevent a failed request from looking
  successful.
- Be ready to demonstrate keyboard focus and the narrow-window layout.

### Kay Khine Maw — Tech Lead

**Architecture explanation — 1 minute**

> The application uses Next.js App Router with server-side route handlers,
> Prisma and PostgreSQL. The browser does not connect directly to the database
> and provider credentials remain server-side. Protected routes derive the
> current user from the verified HTTP-only `interntrack_session` cookie.

> Internship reads and writes are scoped by the authenticated user's ID. The
> server checks ownership before loading, updating or deleting an internship,
> and related operations follow the same ownership boundary. The explicit save
> request validates the reviewed payload, checks duplicate policy, then
> persists the record. The UI updates only after the server confirms success.

**During demo — 45 seconds**

> I will reopen the saved record and refresh the page. This demonstrates that
> the data came from PostgreSQL through the API rather than from a success
> message or browser-only mock state. If the database request fails, the
> application exposes the error instead of showing a false save.

**Q&A preparation**

- Be ready to name the relevant routes: `/api/auth`, `/api/extract`,
  `/api/internships`, `/api/profile` and `/api/translate`.
- Explain that sessions are stored server-side and passwords are salted hashes.
- Do not claim production hardening that is listed as out of scope, such as
  account recovery, email verification or rate limiting.

### Nway Nway Zay Ya — AI Lead

**AI logic and proof — 1 minute**

> Gemini is used on the server for structured internship extraction and
> supported translation. The source text is bounded before it is sent, and the
> response is parsed, validated and normalized. Missing strings become null and
> missing lists become empty lists. The system preserves uncertainty instead of
> inventing a deadline, document or skill.

> The important control is the human review gate. AI returns an editable draft;
> it does not create the final internship by itself. The student corrects the
> result, and only the explicit Save action persists it. The matching feature is
> separate deterministic application logic: it reports matched, not met and
> unknown criteria and does not present the result as a hiring prediction.

**During demo — 30 seconds**

> I will point to one extracted field and one missing field. The extracted value
> can be corrected, while the missing value remains blank or clearly marked.
> This is the proof that extraction completeness is not treated as accuracy.

**AI evidence to show**

- [internshipExtractor.ts](web/lib/ai/internshipExtractor.ts)
- [translateText.ts](web/lib/ai/translateText.ts)
- [matching.ts](web/lib/matching.ts)
- [verify-matching.ts](web/scripts/verify-matching.ts)
- [feature-list.md](.docs/02-design/feature-list.md)

**Important disclosure**

The current source still contains an OpenAI fallback in addition to Gemini.
The project specification says Gemini is the sole provider. Resolve this
scope inconsistency before presenting “Gemini only” as an implementation fact.

### Thura Aung — QA/Test

**Live verification — 1 minute 30 seconds**

> I tested the risky behaviors rather than only checking whether a page exists.
> The duplicate verification script checks normalized URLs, different
> companies, new URLs, empty fields and title matching. The extraction checks
> preserve missing deadlines and empty document lists. The matching verification
> checks weights, aliases, unknown results, zero requirements and resume
> validation.

> The current focused checks passed. The repository is not fully green yet:
> TypeScript and the production build fail because deferred status components
> still reference removed status types, and the dashboard has an iteration
> target error. We will not hide this; it is a release-readiness issue to fix
> before the final demo.

**Test result wording**

> Our evidence is source-linked. The duplicate result comes from
> `web/scripts/verify-duplicates.ts`; the matching result comes from
> `web/scripts/verify-matching.ts`; and the commands are defined in
> `web/package.json`. We distinguish focused behavior tests from complete
> system acceptance.

**Q&A preparation**

- Explain the difference between a focused test passing and the build passing.
- Show the exact command and output source for every number on the test slide.
- Do not describe the current build as passing until `npx tsc --noEmit` and
  `npm run build` pass after the status/type fixes.

## Live demo runbook

### Before the team enters the room

- Start PostgreSQL and verify the configured credentials.
- Start the application from `web/`.
- Sign in with a prepared test account.
- Prepare one safe, public internship URL or synthetic test document.
- Prepare a second submission with the same source URL for duplicate testing.
- Confirm that no real personal data, API keys or private documents are visible.
- Open the browser at the sign-in page and keep the terminal hidden.
- Run the focused verification commands once and save the output.
- Fix the current TypeScript/build blockers before claiming the demo is ready.

### Demo sequence

1. **Nang:** Sign in and identify the student workflow.
2. **Nang:** Open Add Internship and submit the prepared URL/file.
3. **Nway:** Explain the server-side Gemini extraction while loading is visible.
4. **Pyae:** Correct at least one extracted field and show a missing field.
5. **Kay:** Save explicitly and show the success result only after persistence.
6. **Kay:** Refresh or reopen the detail page to prove persistence.
7. **Thura:** Submit the same source again and show the duplicate warning.
8. **Nang:** Choose the explicit decision path: view existing, return, or add
   anyway. Do not accidentally create an unwanted duplicate.
9. **Thura:** Show the test command/output slide.
10. **Nway:** Show the AI source and deterministic matching proof.

### Recovery plan

- If extraction fails: use the prepared synthetic document and explain that the
  failure state is intentional evidence, then continue with a saved test draft
  only if the application has a documented demo setup.
- If the database fails: stop claiming persistence and explain the environment
  failure; do not fake a successful save.
- If a duplicate dialog does not appear: stop and use the test output rather
  than claiming the live behavior passed.
- If the timer reaches 10:00: stop immediately and leave Q&A for the examiner.

## Test results and before/after slide

The rubric requires before and after values. The team must measure the “before”
condition before presenting. Do not label an unmeasured assumption as a result.

| Measure | Before value | After value | Source/method |
|---|---:|---:|---|
| Duplicate scenario pass rate | `[MEASURE BEFORE]` | `[RUN ON PRESENTATION DAY]` | `npm run test:duplicates`; [verify-duplicates.ts](web/scripts/verify-duplicates.ts) |
| Extraction missing-field preservation | `[MEASURE BEFORE]` | `[RUN ON PRESENTATION DAY]` | `npm run test:extract`; [verify-extract.ts](web/scripts/verify-extract.ts) |
| Matching/resume focused checks | `[MEASURE BEFORE]` | `[RUN ON PRESENTATION DAY]` | `npm run test:matching`; [verify-matching.ts](web/scripts/verify-matching.ts) |
| TypeScript type check | `[CAPTURE BASELINE]` | `[MUST PASS BEFORE PRESENTING]` | `npx tsc --noEmit` |
| Production build | `[CAPTURE BASELINE]` | `[MUST PASS BEFORE PRESENTING]` | `npm run build` |
| Manual core workflow completion time | `[TIME WITHOUT INTERNTRACK]` | `[TIME WITH INTERNTRACK]` | Same source, same operator, three recorded trials |
| Manual duplicate detection | `[BASELINE METHOD/TIME]` | `[TIME WITH SERVER CHECK]` | Same two records, three recorded trials |

For timing measurements, show the number of trials, the measured values and the
average calculation in the speaker notes. Use the same input and operator for
both conditions. If a baseline cannot be measured fairly, say “not measured”
instead of inventing a comparison.

## Roles, lessons and AI disclosure slide

### Roles

- **Nang:** product scope, user problem, workflow and demo narrative.
- **Kay:** Next.js architecture, server routes, authentication, persistence and
  ownership boundaries.
- **Pyae:** design system, review flow, states, accessibility and responsive UI.
- **Nway:** Gemini extraction/translation integration, normalization and
  explainable matching logic.
- **Thura:** focused verification, edge cases, regression evidence and demo QA.

### Lessons learned

Use only lessons the team can defend:

1. AI output must remain a draft until a person reviews and saves it.
2. Missing data must stay missing; defaults can silently create false facts.
3. Duplicate checks must be server-enforced, not only visual client warnings.
4. A passing feature script does not prove that the type check and production
   build pass.
5. Requirements, implementation, tests and presentation evidence must agree.

### AI disclosure script

> We used AI assistance during development for code exploration, drafting,
> debugging support and test-case ideas. The team reviewed the generated work,
> adapted it to the requirements, ran the verification commands and remains
> responsible for the final code and claims. In the product itself, Gemini is
> used server-side for structured extraction and translation; its output is
> validated and shown as an editable draft. The application does not treat AI
> confidence or completeness as proof of correctness.

## Three-minute Q&A allocation

| Likely question | Primary answer |
|---|---|
| What problem does InternTrack solve? | Nang |
| What did you personally design? | Pyae |
| How is one student's data protected from another? | Kay |
| Where does AI run and what does it receive? | Nway |
| How do you know duplicate handling works? | Thura |
| What happens when AI misses a deadline? | Nway, then Pyae |
| Does extraction automatically save data? | Kay and Nang |
| What is the current limitation? | Thura: build/type issues and documented scope gaps |
| Is the matching score a hiring prediction? | Nway: no, it is provisional and explainable |
| Why is a test passing not enough? | Thura: focused checks do not prove build/runtime acceptance |

Every member should answer in first person about their own work before handing
off. Never answer with “AI did that.”

## Prompt for Claude to generate presentation slides

Copy the following prompt into Claude and attach this `PRESENTATION.md`,
`README.md`, the requirements specification, backlog and the latest test
outputs:

```text
Create a professional 10-minute university software-project presentation for
InternTrack, a Next.js/TypeScript/Prisma/PostgreSQL internship tracker.

Use the attached PRESENTATION.md as the source of truth for:
- the 5 presenters and their roles;
- the exact 10-minute speaking order;
- the live Must-task demo;
- the test evidence and current limitations;
- the AI logic and disclosure wording.

Generate:
1. A slide-by-slide outline with no more than 10 slides.
2. Concise slide text suitable for projection.
3. Presenter notes containing the full script for the assigned speaker.
4. A 3-minute Q&A preparation slide with one question per team member.
5. A final hidden/backup slide containing sources and commands.

Required slide coverage:
- Problem and target users.
- Product workflow: capture -> extract -> review/correct -> explicitly save -> reopen.
- Live demo steps for the Must requirements; do not use screenshots as a
  substitute for the live demo.
- Test results with a before/after comparison table.
- AI logic: where it runs, how inputs are minimized, how responses are
  normalized, how human review prevents automatic persistence, and how the
  deterministic matching logic is measured.
- Roles, lessons learned and AI disclosure.

Strict evidence rules:
- Do not invent metrics, timings, pass rates, user counts, accuracy values or
  before/after numbers.
- If a value is missing, display "[MEASURE BEFORE PRESENTATION]" and add a
  presenter-note instruction explaining exactly how to measure it.
- Put the source command or repository file beside every number.
- Clearly distinguish focused tests from complete system acceptance.
- Do not claim the TypeScript check or production build passes unless the
  attached latest output says it passes.
- Do not claim Gemini is the sole implemented provider if the attached source
  still contains another provider fallback; flag that as a scope inconsistency.
- Do not claim deferred status tracking, email/push notifications, sharing,
  automatic applications or production authentication hardening.

Visual style:
- Clean, modern student-product presentation.
- Use a restrained indigo/blue/orange palette.
- Prefer diagrams of the workflow and server/database/AI boundaries over dense
  paragraphs.
- Keep each slide readable from the back of a lab room.
- Include speaker names and role labels in presenter notes, not as clutter on
  every slide.
- Add a visible 10-minute timing plan and a small “live demo” marker.

Return the result in this exact structure:
SLIDE 1: ...
SPEAKER:
TIME:
ON-SLIDE CONTENT:
VISUAL:
PRESENTER NOTES:
SOURCE/EVIDENCE:

Repeat for each slide, then provide:
- FINAL REHEARSAL CHECKLIST
- UNRESOLVED EVIDENCE TO MEASURE
- Q&A QUESTIONS BY MEMBER
```

## Final acceptance checklist

- [ ] Current TypeScript errors are fixed.
- [ ] `npm run build` passes.
- [ ] PostgreSQL credentials are verified on the demo laptop.
- [ ] The live Must workflow has been rehearsed end-to-end.
- [ ] Before/after numbers are measured with sources.
- [ ] No slide contains an unsupported claim.
- [ ] Each member can explain their own contribution and one AI question.
- [ ] The AI provider scope inconsistency is resolved or disclosed.
- [ ] The application is already running before entering the room.

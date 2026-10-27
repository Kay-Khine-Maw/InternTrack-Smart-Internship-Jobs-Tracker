# InternTrack Test Plan

## 1. Document Control

| Item | Value |
|---|---|
| Project | InternTrack — Smart Internship Jobs Tracker |
| System under test | `web/`, a Next.js App Router application |
| Plan owner | Nexus team |
| Primary users | University students managing internship opportunities |
| Required user study | At least 10 real-user sessions |
| Acceptance model | Technology Acceptance Model (TAM) only |
| Related requirements | F1–F14, NFR1–NFR8, LR1–LR8 |
| Related backlog | B01–B12, B19, B22, B24–B25; B20 is the user-validation backlog item |
| Last reviewed | 2026-10-28 |

This plan is based on the current repository, including the root README,
`CLAUDE.md`, the requirements and backlog, the design documentation, the
Prisma schema, route handlers, application pages, and the existing verification
scripts. It is a test plan, not a claim that every test has already been
executed.

## 2. System Description

InternTrack helps a student capture internship opportunities from URLs or
uploaded files, extract structured information, review and correct the draft,
explicitly save it, and later reopen and manage the record.

The current implementation includes:

- Next.js 14 App Router and TypeScript.
- PostgreSQL persistence through Prisma.
- Local email/password sign-up, sign-in and sign-out.
- PostgreSQL-backed sessions represented by the HTTP-only
  `interntrack_session` cookie.
- Server-side ownership checks for protected records and related data.
- Gemini-based extraction and translation paths as documented by the current
  application guide.
- URL, PDF, DOCX, PNG and JPG source handling.
- Profile management and temporary PDF/DOCX resume extraction for review.
- Internship requirements, skills, priority, notes, documents, tags, dates,
  calendar events, search, translation, duplicate checks and deletion.
- Deterministic profile matching with explainable criteria, `Unknown` results,
  normalized requirement categories and legacy requirement fallback.

Application-status tracking and status badge colors are **deferred**. The
supported record-management feature in this plan is priority management, not
status transitions.

## 3. Test Objectives

The test programme will determine whether InternTrack:

1. Implements the specified capture → extract → review → save → reopen flow.
2. Preserves user control by requiring explicit saving after extraction.
3. Persists records and profile data correctly across reloads and restarts.
4. Enforces authentication, authorization and account isolation.
5. Handles invalid input, provider failure, database failure and duplicate
   decisions without false success.
6. Provides usable profile, internship, preparation, calendar, search,
   translation and matching workflows.
7. Supports students in completing the principal tasks faster and with fewer
   errors than their pre-InternTrack method.
8. Produces acceptable usability and technology-acceptance evidence through
   SUS and TAM questionnaires.

## 4. Scope

### 4.1 In scope

- Authentication:
  - Sign-up, sign-in, sign-out and session recovery after expiry.
  - Eight-character minimum password policy.
  - Duplicate-email handling.
  - Unauthenticated and cross-account access rejection.
- Profile:
  - Loading, editing and saving profile data.
  - Blank initial profile for a new account.
  - Resume upload, extraction draft, correction and explicit apply/save.
  - Address, major, year, skills, tools and internship start/end dates.
- Internship capture and extraction:
  - URL, PDF, DOCX, PNG and JPG inputs.
  - Validation, unsupported files, unreadable content and provider failures.
  - Review, correction, missing values and cancellation.
- Persistence:
  - Create, list, reopen, edit, delete and reload internship records.
  - Priority, notes, documents, tags, deadlines, follow-ups and interview
    details.
  - Extraction-history linkage and retention behavior where exposed.
- Duplicate handling:
  - URL normalization.
  - Company/position matching.
  - View-existing, return-to-review and explicit override.
- Profile matching:
  - Required, preferred, matched, not met, unknown and insufficient states.
  - Category aliases, phrase tolerance, singular/plural tolerance and legacy
    fallback.
- Calendar, search and translation.
- Accessibility, responsive layout, error visibility and data protection.
- Real-user usability and acceptance evaluation.

### 4.2 Out of scope for this release

- Application-status transitions and status badge colors.
- Account recovery, email verification, production rate limiting and
  deployment-specific CSRF hardening.
- Email or push notifications.
- Employer, university-staff or reviewer accounts.
- Sharing or collaboration between users.
- Payments, messaging, electronic signatures and automated applications.
- Production file retention beyond the documented extraction workflow.
- Hiring prediction or recommendation validity.

## 5. Implementation Status, Planned Features and Assumptions

### 5.1 Implemented features to verify

The backlog marks the following as implemented or implemented with acceptance
still pending: dashboard summary (B01), source capture (B02), extraction
(B03), review (B04), persistence (B05), duplicate handling (B06),
record updates and priority (B07), profile management (B10), translation
(B11), authentication and ownership (B12), resume-assisted profile
completion (B24), and explainable matching (B25). Document/checklist and
calendar workflows are also represented as implemented in the backlog.

“Implemented” means that code and focused checks exist; this plan still
requires system and user evidence before acceptance.

### 5.2 Planned or deferred features

Status tracking, status values and status badge colors are deferred. They must
not be included as passing acceptance criteria in this release. Production
authentication hardening, account recovery, email verification, rate limiting,
CSRF deployment controls, retention decisions and personal-data rights
operations remain planned or require a decision.

### 5.3 Test assumptions

1. Testing uses a dedicated PostgreSQL database and synthetic internship
   postings, not real student resumes or private employer documents.
2. The test environment has Node.js 20+, npm, Docker/PostgreSQL, a valid
   test-only Gemini key when provider tests are enabled, and Playwright
   browser dependencies.
3. Network-dependent extraction and translation tests may be run in a
   controlled environment with recorded synthetic inputs. Provider outages
   are tested separately as failure conditions.
4. The user study recruits at least ten real university students or recent
   graduates who have searched for internships. No participant is required to
   disclose a real application, resume, email address or personal document.
5. Results from ten sessions are evidence for this study sample, not a claim
   of statistical representation of all students.
6. Existing seeded records are treated as test fixtures only. Each
   participant receives a separate account or a reset test account.
7. TAM is the only acceptance model used. SUS is a usability scale, not a
   second acceptance model; UTAUT2 is not administered.

## 6. Test Environment and Data

### 6.1 Environments

| Environment | Purpose | Data policy |
|---|---|---|
| Local development | Developer checks and rapid diagnosis | Synthetic fixtures only |
| Dedicated integration environment | API, database and browser tests | Isolated PostgreSQL database |
| User-study environment | Ten supervised or remotely observed sessions | One isolated account per participant; no real personal documents |
| Pre-release environment | Final regression and acceptance evidence | Database snapshot or resettable synthetic data |

The documented local database uses Docker PostgreSQL on host port `5433` to
avoid conflict with a Windows PostgreSQL service on `5432`.

### 6.2 Required fixtures

- Six or more synthetic internship postings, including:
  - Complete structured posting.
  - Missing deadline.
  - Missing documents.
  - Non-English fields.
  - Legacy record with `requirements` and `skills` but no reviewed matching
    requirements.
  - Duplicate URL and duplicate company/position variants.
- Synthetic resume files:
  - Valid PDF with address, major, university and year.
  - Valid DOCX with partial information.
  - File with missing year and preferred location.
  - Unsupported file type.
  - Unreadable or corrupt file.
- Synthetic accounts:
  - Account A with one or more records.
  - Account B with no records.
  - Expired-session test account.
- Controlled failure fixtures:
  - Invalid JSON or unavailable AI response.
  - Database unavailable during save.
  - Unauthorized record identifier.
  - Duplicate email at sign-up.

### 6.3 Data protection controls

- Obtain informed consent before each user session.
- Use participant IDs such as `P01` rather than names in results.
- Do not collect real passwords, resumes, application URLs or personal notes.
- Store screen recordings only when separately consented.
- Keep study exports in an access-controlled location.
- Delete test accounts and uploaded fixtures after the retention period.
- Never put API keys or participant data in source control or logs.

## 7. Test Levels and Methods

### 7.1 Static and code-quality verification

Run the repository commands from `web/`:

```powershell
npm run lint
npm run test:duplicates
npm run test:extract
npm run test:matching
npx tsc --noEmit
npm run build
```

Record each command, date, commit, result and known limitation. The existing
focused scripts are not substitutes for browser, integration or user testing.
Known pre-existing TypeScript issues in application-status components must be
recorded rather than silently attributed to unrelated tests.

### 7.2 Unit and component testing

Use the existing TypeScript verification scripts and add no application code
as part of this document. The current scripts cover duplicate matching,
empty extraction fields, normalization, matching aliases, unknown states,
legacy fallback and resume-schema validation.

Additional planned unit coverage should target:

- Session expiry and cookie handling.
- Password policy and email normalization.
- Profile normalization and blank optional values.
- Priority validation.
- Date parsing and calendar event mapping.
- Translation response validation.

### 7.3 API and integration testing

Exercise route handlers against the dedicated PostgreSQL database:

- `/api/auth/signup`
- `/api/auth/signin`
- `/api/auth/signout`
- `/api/auth/me`
- `/api/profile`
- `/api/profile/resume`
- `/api/extract`
- `/api/internships`
- `/api/internships/:id`
- `/api/internships/:id/match`
- `/api/translate`

Verify response status, response shape, database state, ownership and
transaction behavior. API tests must include both successful and rejected
requests.

### 7.4 System and end-to-end testing

Use a real browser against the running Next.js application. Verify navigation,
loading, empty, correction, error, success, responsive and persistence states.
The principal system path is:

```text
sign up/sign in → add source → extract → review/correct → save →
reopen → edit priority/details → manage documents/dates → search/calendar →
match/translate → delete → sign out
```

### 7.5 Security and authorization testing

Test session absence, invalid session, expired session, sign-out invalidation,
cross-account internship access, cross-account profile access, nested document
access, extraction-history ownership, matching ownership and translation
ownership. Confirm that a client-supplied user ID cannot expand access.

### 7.6 Usability and acceptance testing

Conduct the ten-session study described in Section 10. Collect task
performance, errors, assistance, qualitative observations, SUS and TAM after
the post-system tasks.

## 8. Functional Test Cases

The following cases are the minimum regression set. “Pass” requires the
expected result and the relevant database/API evidence.

| ID | Area | Preconditions | Test steps | Expected result |
|---|---|---|---|---|
| AUTH-01 | Sign-up | No account for the email | Submit valid name, email and eight-character password | Account is created, session is established, and dashboard opens |
| AUTH-02 | Sign-up validation | None | Submit blank fields, invalid email and password under eight characters | Clear validation error; no account or session is created |
| AUTH-03 | Duplicate email | Existing account | Sign up with the existing email | `409`-style conflict message; existing account is unchanged |
| AUTH-04 | Sign-in | Existing account | Submit correct credentials | Session is created and protected application opens |
| AUTH-05 | Invalid sign-in | Existing account | Submit wrong password and unknown email | Generic authentication error; no protected access |
| AUTH-06 | Sign-out | Authenticated account | Select sidebar logout | Server session is invalidated, cookie expires, and auth page appears |
| AUTH-07 | Session expiry | Expired session fixture | Request `/api/auth/me` and open a protected page | `401`/redirect; no protected data is shown |
| AUTH-08 | Account isolation | Account A has data; Account B is empty | Sign in as B and open dashboard, profile and internships | B sees blank profile and no A records |
| AUTH-09 | Cross-account API access | Two accounts and known record ID | Call profile, internship, match, document-related and translation routes using the other session | Access is rejected or record is not found; no data is disclosed |
| PROF-01 | Profile load/save | Authenticated new account | Edit name, major, year, address, skills, tools and dates; save; reload | Values persist for the current account |
| PROF-02 | Blank optional fields | New account | Leave year and preferred location blank; save and reload | Fields remain blank; no mock/default values are inserted |
| PROF-03 | Resume PDF review | Valid synthetic PDF | Upload resume, inspect draft, edit a fact, apply and save profile | Draft is editable; no profile change occurs before explicit apply/save |
| PROF-04 | Resume DOCX and missing facts | Valid partial DOCX | Upload and apply draft without year/location | Present facts are retained; missing facts remain blank |
| PROF-05 | Resume failure | Corrupt/unsupported file | Upload file | Clear error; existing profile remains unchanged |
| EXT-01 | URL extraction | Valid synthetic URL fixture | Submit URL and wait for draft | Structured draft appears; no internship is saved yet |
| EXT-02 | File extraction | Valid PDF, DOCX, PNG and JPG fixtures | Submit each supported file | Appropriate extraction path returns a reviewable draft |
| EXT-03 | Invalid source | Empty, unsupported or unreadable source | Submit source | Actionable validation/extraction error; no false success |
| EXT-04 | Review correction | Draft with wrong/missing fields | Edit company, position, deadline, requirements, skills and notes | Edits remain visible and are used for save |
| EXT-05 | Cancel review | Extracted draft | Cancel and confirm | No internship is created; extraction-history behavior follows retention rules |
| SAVE-01 | Explicit save | Valid reviewed draft | Select priority and save | One internship is persisted and displayed only after success |
| SAVE-02 | Required fields | Draft missing company or position | Attempt save | Validation error; no record is created |
| SAVE-03 | Reload/reopen | Saved record | Reload browser, leave page, return and reopen record | Persisted values remain consistent |
| SAVE-04 | Edit details/priority | Saved record | Change priority, notes and supported details; reload | Changes persist; no status transition is offered |
| SAVE-05 | Documents | Saved record | Add, rename, complete, uncomplete and remove checklist item | Checklist state persists and remains scoped to the internship |
| SAVE-06 | Dates/calendar | Saved record | Add deadline, follow-up and interview details; open calendar | Events display correctly and open the related internship |
| DUP-01 | URL duplicate | Existing record with normalized URL | Add same URL with tracking parameters | Duplicate warning identifies the correct record |
| DUP-02 | Title duplicate | Existing company and position | Add same company/position with different URL | Duplicate warning appears when URL matching is unavailable |
| DUP-03 | Duplicate decisions | Duplicate warning | Return, view existing and explicitly override in separate runs | Each choice has the correct outcome; override creates only one intended record |
| SEARCH-01 | Search/filter | Several synthetic records | Search by company/position and use available filters | Matching records appear; stored data is not mutated |
| MATCH-01 | Ready match | Profile and reviewed requirements | Open match panel | Deterministic percentage and criterion results are shown |
| MATCH-02 | Unknown/insufficient | Missing profile facts or empty requirements | Open match panel | Unknown or insufficient state is shown; no invented score |
| MATCH-03 | Legacy match | Record has only requirements/skills | Open match panel | Legacy fallback produces a usable assessment |
| TRANS-01 | Translation | Non-English supported field | Request English translation; switch original/English | Translation appears, original remains available, and failure is visible |
| DEL-01 | Delete | Saved record | Confirm deletion; reload list and direct URL | Record is removed only after successful server response |
| ERR-01 | Database failure | Stop or isolate database during mutation | Attempt save/update/delete | Clear failure; UI does not claim success or lose recoverable input |
| ERR-02 | Provider failure | Controlled AI failure | Extract or translate | Clear provider error; no partial persistence |
| UI-01 | Responsive/accessibility | Desktop and mobile viewport | Navigate auth, sidebar, forms, dialogs and detail page using keyboard | Labels, focus, layout, errors and dialog controls remain usable |

## 9. Non-Functional Test Criteria

| Area | Measure | Proposed release criterion |
|---|---|---|
| Reliability | Successful save/reopen across repeated trials | At least 95% of valid trials complete without data loss |
| Data integrity | Duplicate, ownership and persistence checks | 100% of security and integrity cases pass |
| Security | Unauthorized and expired-session cases | 100% rejected with no protected data disclosure |
| Usability | SUS score after user sessions | Median SUS at least 70; investigate any score below 50 |
| Efficiency | Task time and completion | Post-system median time improves on at least four of five core tasks |
| Effectiveness | Task completion and critical errors | At least 80% independent completion per core task; no critical privacy error |
| Accessibility | Keyboard, labels, focus and visible errors | No blocking issue in the tested flows |
| Performance | Page/API response under local test load | Record p50/p95; investigate p95 above 2 seconds for ordinary local CRUD |
| Maintainability | Lint, type-check, build and focused scripts | Results recorded; known baseline failures explicitly separated |

These are proposed release thresholds and may be revised only before data
collection. Any revision must be recorded with the reason.

## 10. Real-User UAT Study

### 10.1 Mandatory design

- **Participants:** 10 real users minimum, preferably university students or
  recent graduates who have searched for internships.
- **Sessions:** 10 completed sessions minimum, one session per participant.
  A participant may complete a second session only as a documented replacement
  for an invalid or interrupted session; the total must still contain ten
  valid sessions.
- **Duration:** 45–60 minutes per session.
- **Mode:** Moderated in person or remote screen-share with consent.
- **Study design:** Within-subject before/after comparison.
- **Before condition:** Participant completes the same five information tasks
  using their usual method (for example, browser tabs plus notes or a blank
  spreadsheet), without InternTrack.
- **After condition:** Participant completes equivalent tasks using InternTrack.
- **Order:** Before condition always precedes after condition to measure the
  intended change from the current workflow. Record possible learning effects.
- **Evidence:** Task times, completion, errors, assistance, omissions,
  observations, participant comments, SUS and TAM.

### 10.2 Participant tasks

Use the same synthetic posting and participant profile scenario for
comparability. Do not require a participant to use real personal data.

| Task | Participant instruction | Primary measure |
|---|---|---|
| UAT-01 | Find the company, role, location, deadline and requirements from a posting and record them using your usual method / InternTrack | Time, completeness and transcription errors |
| UAT-02 | Add the posting to your internship pipeline and correct one intentionally incomplete field | Completion, correction success and assistance |
| UAT-03 | Return to the saved record, set a priority, add a note and add one required document | Time, completion and data accuracy |
| UAT-04 | Find the record again, check its deadline/interview information in the calendar, and search for it | Findability, time and navigation errors |
| UAT-05 | Compare the posting with the provided student profile and explain which requirements are matched, unknown or not met | Match interpretation accuracy and confidence |

An optional sixth task may test profile resume review and translation if time
allows; it does not replace the five mandatory tasks.

### 10.3 UAT acceptance criteria

The release is UAT-acceptable when:

1. At least ten valid sessions are completed.
2. No participant experiences a confirmed cross-account data disclosure.
3. At least 8 of 10 participants independently complete each mandatory task,
   or the task is classified as requiring redesign.
4. The post-system median time is lower than the baseline median for at least
   four of the five mandatory tasks.
5. The median SUS score is at least 70.
6. TAM usefulness, ease-of-use and intention-to-use results meet the thresholds
   in Section 12 or are accompanied by a documented remediation decision.
7. All critical functional and authorization cases pass.

## 11. Before/After Measurement Protocol

For every task and participant, record:

- Start timestamp and end timestamp.
- Completion: independent, completed with assistance, or failed.
- Number and type of errors.
- Number of moderator interventions.
- Missing or incorrect fields.
- Participant confidence from 1 (not confident) to 5 (very confident).
- Observed frustration or confusion, using neutral notes.

### 11.1 Measures

**Task time**

```text
time_seconds = end_timestamp - start_timestamp
```

**Completion rate**

```text
completion_rate = independent_completions / valid_attempts × 100
```

**Critical-error rate**

```text
critical_error_rate = critical_errors / valid_attempts × 100
```

Critical errors include saving incorrect ownership data, exposing another
user’s record, deleting the wrong record, or reporting a failed save as
successful. A participant needing a hint is not automatically a critical
error.

**Before/after improvement**

```text
time_improvement = (baseline_median - post_median) / baseline_median × 100
error_reduction = (baseline_error_rate - post_error_rate) / baseline_error_rate × 100
```

Report medians and interquartile ranges because the sample is small. Report
each participant’s paired result as well as aggregate results. Do not claim
statistical generalisation from ten sessions.

## 12. Questionnaires

### 12.1 SUS questionnaire

Administer after the InternTrack tasks and before the interview discussion.
Use a five-point scale:

1 = Strongly disagree, 2 = Disagree, 3 = Neither agree nor disagree,
4 = Agree, 5 = Strongly agree.

1. I think that I would like to use InternTrack frequently.
2. I found InternTrack unnecessarily complex.
3. I thought InternTrack was easy to use.
4. I think that I would need the support of a technical person to use
   InternTrack.
5. I found the various functions in InternTrack were well integrated.
6. I thought there was too much inconsistency in InternTrack.
7. I would imagine that most people would learn to use InternTrack very
   quickly.
8. I found InternTrack very cumbersome to use.
9. I felt very confident using InternTrack.
10. I needed to learn a lot of things before I could get going with
    InternTrack.

SUS scoring:

- For odd-numbered items, subtract 1 from the response.
- For even-numbered items, subtract the response from 5.
- Add the ten adjusted values and multiply by 2.5.
- Report the score from 0 to 100, median, range and per-participant scores.

SUS is a usability instrument and is not counted as an acceptance model.

### 12.2 Technology Acceptance Model (TAM) questionnaire

TAM is the **only acceptance model** in this plan. Do not administer UTAUT2
or another acceptance model for the same acceptance decision.

Use a seven-point scale:

1 = Strongly disagree, 2 = Disagree, 3 = Somewhat disagree,
4 = Neither agree nor disagree, 5 = Somewhat agree, 6 = Agree,
7 = Strongly agree.

**Perceived usefulness (PU)**

1. InternTrack would improve my ability to organise internship opportunities.
2. InternTrack would make it easier to keep deadlines, documents and notes
   together.
3. InternTrack would help me avoid re-entering internship information.
4. InternTrack would improve my effectiveness when preparing internship
   applications.

**Perceived ease of use (PEOU)**

5. Learning to use InternTrack would be easy for me.
6. I would find it easy to get InternTrack to do what I want.
7. It would be easy for me to become skilful at using InternTrack.
8. I would find InternTrack easy to use.

**Behavioural intention (BI)**

9. Assuming access were available, I intend to use InternTrack for internship
   tracking.
10. I would recommend InternTrack to a student managing internship
    applications.

Calculate the mean for PU items, PEOU items and BI items for each participant,
then report the sample median and range. Proposed acceptance indicators are:

- PU median ≥ 5.0/7.
- PEOU median ≥ 5.0/7.
- BI median ≥ 5.0/7.

These thresholds are decision indicators, not proof of market adoption.
Qualitative reasons must accompany any score below threshold.

## 13. Supporting Templates

### 13.1 Session cover sheet

```text
InternTrack UAT Session
Participant ID: P__
Date:
Moderator:
Mode: in person / remote
Device and browser:
Prior internship-tracking experience: none / low / moderate / high
Consent obtained: yes / no
Recording consent: yes / no / not recorded
Accessibility or language needs:
Environment issues:
```

### 13.2 Task measurement sheet

Repeat one row for each of UAT-01 to UAT-05 and for both conditions.

```text
Participant ID: P__
Task ID:
Condition: BEFORE / AFTER
Start time:
End time:
Time in seconds:
Outcome: independent / assisted / failed
Critical error: yes / no
Other errors and omissions:
Moderator interventions:
Confidence (1–5):
Participant comment:
```

### 13.3 Observation and issue log

```text
Observation ID:
Participant ID:
Task ID:
Timestamp:
Observed behaviour or quote:
Classification: usability / functional / data / performance / accessibility
Severity: critical / high / medium / low
Reproducible: yes / no / unknown
Related requirement or test case:
Immediate action:
Follow-up owner:
```

Severity definitions:

- **Critical:** privacy breach, data loss, wrong-account access or a blocked
  core workflow.
- **High:** a core task cannot be completed without moderator intervention or
  a result is materially incorrect.
- **Medium:** a recoverable defect or substantial confusion.
- **Low:** cosmetic, wording or minor interaction issue.

### 13.4 SUS response sheet

```text
Participant ID: P__
Use 1–5: 1 Strongly disagree, 5 Strongly agree

Item 1:  __    Item 2:  __    Item 3:  __    Item 4:  __    Item 5:  __
Item 6:  __    Item 7:  __    Item 8:  __    Item 9:  __    Item 10: __

Adjusted total:
SUS score:
```

### 13.5 TAM response sheet

```text
Participant ID: P__
Use 1–7: 1 Strongly disagree, 7 Strongly agree

PU1: __  PU2: __  PU3: __  PU4: __
PEOU1: __  PEOU2: __  PEOU3: __  PEOU4: __
BI1: __  BI2: __

PU mean:
PEOU mean:
BI mean:
Comments explaining low scores:
```

### 13.6 Exit interview prompts

Ask the same prompts in the same order, allowing neutral follow-up:

1. Which task was easiest and why?
2. Which task was hardest or least clear?
3. Did the review-before-save flow give you enough control over extracted
   information?
4. Did the profile match result help you understand what to review?
5. Did you trust that your records belonged only to your account?
6. What would you change before using InternTrack for a real internship?
7. Was any information missing, misleading or difficult to find?
8. Is there anything about the deferred application-status feature that you
   expected but could not find?

## 14. Test Schedule

The schedule assumes a six-week evaluation period and may be shifted without
changing the required evidence.

| Week | Activity | Deliverable |
|---|---|---|
| 1 | Freeze requirements, confirm scope, prepare dedicated database, create synthetic fixtures and consent materials | Environment checklist and fixture set |
| 1 | Run static checks and existing duplicate, extraction and matching scripts | Baseline verification record |
| 2 | Execute API/integration cases for authentication, ownership, profile, extraction and persistence | API test results and defect log |
| 2 | Execute browser regression for the core workflow, duplicates, documents, dates, search, matching and translation | System-test results |
| 3 | Fix or triage blocking defects; rerun failed critical cases; verify clean test data | Retest report |
| 3 | Pilot one user session and refine wording or timing without changing acceptance thresholds | Pilot notes and approved protocol |
| 4 | Conduct sessions P01–P05, recording before/after task measures, SUS, TAM and observations | Five completed session packets |
| 5 | Conduct sessions P06–P10 using the same protocol | Five completed session packets |
| 6 | Analyse task results, SUS, TAM and qualitative findings; run final regression and UAT review | Final test report and acceptance recommendation |

No participant data should be collected before the environment, consent
materials and synthetic fixtures are approved.

## 15. Entry and Exit Criteria

### 15.1 Entry criteria

- Test build is identified by commit or version.
- Dedicated database is available and resettable.
- Environment variables and test-only provider credentials are configured.
- Synthetic fixtures are validated.
- Critical routes can start and respond.
- User-study protocol, consent text and questionnaires are approved.
- Ten eligible participants are recruited or scheduled.

### 15.2 Exit criteria

- All critical functional and authorization cases pass.
- All failed cases have a disposition: fixed, accepted limitation, deferred
  with owner, or blocked with reason.
- Ten valid real-user sessions are complete.
- Before/after measures, SUS and TAM responses are complete for each valid
  session, apart from documented missing responses.
- No unresolved critical privacy, ownership or data-loss defect remains.
- Final report includes actual commands, results, metrics, limitations and
  acceptance decision.

## 16. Defect Management and Reporting

Every defect must include:

- Unique issue ID.
- Environment and build.
- Reproduction steps.
- Expected and actual result.
- Severity and evidence.
- Related requirement, backlog item and test case.
- Data/privacy impact.
- Owner, status and retest result.

The final report must separate:

1. Automated verification results.
2. API/integration results.
3. Browser/system results.
4. Ten-session UAT results.
5. SUS results.
6. TAM results.
7. Deferred features and known limitations.

## 17. Traceability Matrix

| Requirement/backlog | Verification coverage |
|---|---|
| F1 / B10 / B24 | PROF-01 to PROF-05; UAT-05; resume review |
| F13 / B12 | AUTH-01 to AUTH-09; SEC tests; UAT sign-in |
| F14 / B25 | MATCH-01 to MATCH-03; existing matching script; UAT-05 |
| F2–F4 / B02–B04 | EXT-01 to EXT-05; UAT-01 and UAT-02 |
| F5 / B05 | SAVE-01 to SAVE-03; persistence checks; UAT-02 |
| F6 / B06 | DUP-01 to DUP-03; `test:duplicates` |
| F7 / B07 | SAVE-04; priority and detail checks; UAT-03 |
| F8 / B08 | SAVE-05; UAT-03 |
| F9 / B09 | SAVE-06; UAT-04 |
| F10 / B19 | SEARCH-01; UAT-04 |
| F11 / B11 | TRANS-01; optional UAT task |
| F12 / B22 | DEL-01; persistence and authorization checks |
| NFR1–NFR8 | Section 9, system tests, performance/accessibility evidence |
| LR1–LR8 | Consent, synthetic data, ownership, retention and security evidence |

## 18. Final Acceptance Record

```text
Build/commit:
Test period:
Automated checks:
API/integration result:
Browser/system result:
Valid real-user sessions: __ / 10 minimum
Core-task completion result:
Before/after measurement result:
Median SUS:
Median TAM PU:
Median TAM PEOU:
Median TAM BI:
Open critical defects:
Deferred features confirmed:
Acceptance decision: ACCEPT / ACCEPT WITH CONDITIONS / NOT ACCEPTED
Conditions and owners:
Test lead:
Product owner:
Date:
```


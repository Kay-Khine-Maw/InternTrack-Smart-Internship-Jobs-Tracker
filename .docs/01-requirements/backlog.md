# InternTrack Product Backlog

### B01 - Dashboard pipeline summary

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want an application overview so I know what needs attention.
- Traces to: F7, F9, NFR1, P3, P6
- Evidence in code: `web/app/dashboard/page.tsx`

### B02 - Capture internship from URL or file

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want to submit a source so I can start an internship draft.
- Traces to: F2, NFR2, LR3, P1, P2
- Evidence in code: `web/app/add-internship/page.tsx`, `web/app/api/extract/route.ts`

### B03 - Structured source extraction

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want structured information so I can reduce manual entry.
- Traces to: F3, NFR4, NFR7, LR2, P2
- Evidence in code: `web/lib/extractors/`, `web/lib/ai/internshipExtractor.ts`

### B04 - Review and correct extracted information

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want to correct the draft so I control the saved information.
- Traces to: F4, NFR4
- Evidence in code: `web/app/add-internship/page.tsx`

### B05 - Save and reopen internships

- Type: Feature
- Priority: Must
- Status: Implemented
- User story: As a Student, I want reliable saved records so I can return to them.
- Traces to: F5, NFR1, NFR3, P1
- Evidence in code: `web/app/api/internships/route.ts`, `web/prisma/schema.prisma`

### B06 - Duplicate warning and override

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want duplicate warnings so I avoid accidental copies.
- Traces to: F6, P5
- Evidence in code: `web/lib/server/duplicates.ts`, `web/components/modals/DuplicateWarningModal.tsx`

### B07 - Application status and record updates

- Type: Feature
- Priority: Must
- Status: Implemented
- User story: As a Student, I want to update my records so they reflect my progress.
- Traces to: F7, NFR1, P6
- Evidence in code: `web/app/internships/[id]/page.tsx`, `web/app/api/internships/[id]/route.ts`

### B08 - Document checklist and preparation notes

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want preparation tasks together so I know what remains.
- Traces to: F8, LR4, P4, P6
- Evidence in code: `web/components/internships/DocumentChecklist.tsx`, `web/app/internships/[id]/page.tsx`

### B09 - Calendar and application dates

- Type: Feature
- Priority: Must
- Status: Implemented
- User story: As a Student, I want dates together so I can plan upcoming actions.
- Traces to: F9, P3, P6
- Evidence in code: `web/app/calendar/page.tsx`, `web/components/layout/NotificationBell.tsx`

### B10 - Profile management

- Type: Feature
- Priority: Must
- Status: Implemented 
- User story: As a Student, I want an updated profile so my preparation information stays current.
- Traces to: F1, LR1, LR4
- Evidence in code: `web/app/profile/page.tsx`, `web/app/api/profile/route.ts`

### B11 - English translation

- Type: Feature
- Priority: Should
- Status: Implemented 
- User story: As a Student, I want translated fields so I can understand posting information.
- Traces to: F11, LR2, P7
- Evidence in code: `web/components/internships/FieldTranslateBar.tsx`, `web/app/api/translate/route.ts`

### B12 - Authentication and ownership

- Type: Security
- Priority: Must
- Status: Backlog
- User story: As a Student, I want secure access so others cannot access my records.
- Traces to: F13, F1, LR4, NFR3
- Dependency: Selected authentication and account-enrollment approach.

### B13 - Personal-data rights

- Type: Compliance
- Priority: Must where applicable
- Status: Needs decision
- User story: As a data subject, I want rights requests handled correctly.
- Traces to: LR4, LR8
- Dependency: Identity-verification process and applicable exceptions.

### B14 - Traffic logging

- Type: Compliance
- Priority: Must if applicable
- Status: Needs decision
- User story: As an operator, I want protected traffic records to meet applicable obligations.
- Traces to: LR5, LR6
- Dependency: Deployment and CCA applicability assessment.

### B15 - Privacy notice and AI processing

- Type: Compliance
- Priority: Must
- Status: Needs decision
- User story: As a Student, I want clear processing information so I understand how my data is used.
- Traces to: LR1, LR2, LR5, NFR3
- Dependency: Processing purposes, lawful-basis assessment and provider details.

### B16 - Validate student problems

- Type: Research
- Priority: Must
- Status: Backlog
- User story: As a team, we want genuine evidence so product choices reflect student needs.
- Traces to: P1, P2, P3, P4, P5, P6, P7

### B17 - Outbound notifications

- Type: Feature
- Priority: Could
- Status: Needs decision
- User story: As a Student, I may want external reminders so I notice upcoming actions.
- Traces to: P3; proposed extension to F9
- Dependency: Scope approval, delivery channel and data-handling decisions.

### B18 - Sharing and collaboration

- Type: Feature
- Priority: Won't for current product scope
- Status: Backlog
- User story: As a Student, I may want to share a record with an authorized reviewer.
- Traces to: Proposed extension to F5 and LR4

### B19 - Search and filter internships

- Type: Feature
- Priority: Should
- Status: Implemented / acceptance pending
- User story: As a Student, I want useful filters so I can find relevant records.
- Traces to: F10, P1, P6
- Evidence in code: `web/app/internships/page.tsx`

### B20 - Usability and workflow validation

- Type: Validation
- Priority: Must
- Status: Backlog
- User story: As a team, we want usability evidence so we can identify workflow problems.
- Traces to: F2, F3, F4, F5, F6, NFR5, NFR6
- Dependency: Testable workflow and suitable participants.

### B21 - Input validation and record integrity

- Type: Security
- Priority: Must
- Status: Backlog
- User story: As a Student, I want invalid operations rejected so my records remain protected.
- Traces to: F5, F8, NFR2, NFR3, LR4

### B22 - Delete internships

- Type: Feature
- Priority: Should
- Status: Implemented / acceptance pending
- User story: As a Student, I want to remove records so my pipeline stays current.
- Traces to: F12, NFR1, LR8
- Evidence in code: `web/app/internships/[id]/page.tsx`, `web/app/api/internships/[id]/route.ts`

### B23 - Build and development verification

- Type: Engineering
- Priority: Must
- Status: Backlog
- User story: As a team, we want reproducible checks so changes can be reviewed reliably.
- Traces to: NFR8
- Evidence in code: `web/package.json`, `web/scripts/`

### B24 - Accessibility and responsive design

- Type: Quality
- Priority: Must
- Status: Backlog
- User story: As a Student, I want accessible screens so I can complete tasks across supported devices.
- Traces to: NFR5, NFR6

### B25 - Performance verification

- Type: Quality
- Priority: Must
- Status: Backlog
- User story: As a Student, I want responsive feedback so I understand system progress.
- Traces to: NFR7

### B26 - Secrets and safe data handling

- Type: Security
- Priority: Must
- Status: Backlog
- User story: As an operator, I want protected credentials and data so they are not exposed.
- Traces to: NFR3, LR3, LR5

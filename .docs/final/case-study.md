# InternTrack Case Study

## Problem

Students need one place to keep internship details that they currently collect from boards, files, and messages. That product goal is in [spec.md](../01-requirements/spec.md) and [proposal.md](../proposal.md).

Five structured responses, U01–U05, are in [interview-transcripts.md](../discover/interview-transcripts.md). Moderated app sessions and interview recordings for those codes were completed on **17 November 2026** and are in [Software Case studies — Interview videos](https://drive.google.com/drive/folders/1DaICWCtuZTEzS48CV5_QI3aj0sFiQPjZ?usp=sharing). Task completion by requirement is in [session-log.md](../test/session-log.md). Before/after task times were not measured. Pains used in [problem-research.md](../discover/problem-research.md) follow the five interview records. P2, P4, P6, and P7 are not stated as baseline facts in the pre-test answers. Counts of those answers are not population statistics.

## Process

### Discover

The charter in [company-charter.md](../discover/company-charter.md) names five members and five roles. No other member is recorded there. [rule.md](../../rule.md) and [CLAUDE.md](../../CLAUDE.md) stay in force. CLAUDE.md and F3 allow OpenAI only as a text-extraction fallback when the Gemini key is missing; that path is recorded in [ai-logic.md](ai-logic.md).

Requirements use Must, Should, Could, and Won't in [spec.md](../01-requirements/spec.md) and [backlog.md](../01-requirements/backlog.md). Application-status tracking is deferred under F7. Backlog identifiers are unique through B28. No backlog item is marked Accepted.

### Build

The running shape is Next.js App Router, server route handlers, Prisma, and PostgreSQL, as [README.md](../../README.md) and [architecture.md](../02-design/architecture.md) describe. PNG/JPG diagrams are under [`.docs/02-design/diagrams/`](../02-design/diagrams/). A class diagram is not in the repository.

Local setup is the root README. `.env` is ignored by `web/.gitignore`. `web/.env.example` is a template with empty `GEMINI_API_KEY` and `OPENAI_API_KEY` fields. `web/lib/server/demoUser.ts` can create a user id from `DEMO_USER_ID` or `demo-user-nway`, with email `nway@interntrack.local` and no password in that create call. The README says shared demo identity is not authentication and that the local setup does not require `DEMO_USER_ID`. This case study does not add a password.

### Test

The test plan is [test_plan.md](../test_plan.md).

## Outcome

The code on disk still does the following, which is why the outcome is "implemented in source", not "accepted":

- The skill-match percentage is the deterministic matched-over-compared count for skill and tool rows. Gemini does not replace that number.
- "Why this percentage" keeps a first sentence from `matchExplanationSentences`. Later sentences may be Gemini-smoothed and stored on the internship when the input hash matches.
- "How to raise this match" shows skill-name cards, a See more dialog, and learning links that include Coursera, Udemy, freeCodeCamp, and LinkedIn Learning search URLs.
- The sidebar and sign-in logo use `w-auto object-contain` (`web/components/layout/Sidebar.tsx`, `web/app/auth/page.tsx`). The logo is not forced into a square.
- The app is light theme only. A dashboard dark theme was removed and is not part of the current interface.
- Status tracking stays deferred. Unused status components still fail the type check. See [issue-log.md](../test/issue-log.md).
- Before and after task times were not measured. Questionnaire means, all from five people: SUS 72/100; TAM usefulness 4.13, ease of use 3.67, intention to use 3.87; UTAUT2 PE 4.20, EE 3.60, SI 3.40, FC 4.30, HM 3.50, BI 4.00. Price value and habit were not scored. Sources: [sus-results.md](../test/sus-results.md), [tam-results.md](../test/tam-results.md), [utaut2-results.md](../test/utaut2-results.md).

## Live URL

A public live URL is not deployed in this repository. The README opens `http://localhost:3000`. Localhost is not a public live URL.

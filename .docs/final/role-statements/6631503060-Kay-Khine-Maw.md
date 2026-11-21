# Role Statement — Kay Khine Maw (6631503060)

**Role:** Tech Lead

## 1. What I owned

As Tech Lead, I owned application architecture, authentication and session handling, server routes, persistence, and technical integration across InternTrack. I also kept the root README and coding-agent guidance aligned with the specification, and I integrated matching, skill-gap, and production-deployment work so the student workflow stayed consistent from capture to save.

## 2. What I did

I started the repository (`217869c`) and added the requirements and design documentation (`8ad53cb`). I wrote technical documentation and server helpers (`3ac6a72`), then implemented resume matching and internship workflow updates (`ecfff15`). I added the AI match calculation path (`34c8d7a`) and later explained skill matches and gap recommendations while polishing dialogs, the logo ratio, and the light theme (`591bb44`).

On 23 September 2026 I reviewed the README and `CLAUDE.md` as Tech Lead. Later I fixed documentation gaps (`ad42187`, `e37f341`), updated test documentation (`219cf7d`), repaired the Vercel build (`1ff75f7`), and hardened production: Prisma connection limits, LinkedIn/URL extraction for serverless, English skill and tag labels, and the live deployment URL in the README (`f7f4382`).

I do not claim the application-logic commit authored as Crystal-stillalive (`b686215`). That name is not in the company charter, so that commit is not assigned to me.

## 3. What I learned

I learned that Tech Lead ownership is not only writing routes and schema changes. It is also keeping architecture claims honest when a helper script fails. On 17 November 2026, `npm run test:matching` failed because the script expected a null score while `calculateMatch` returned 100, and `npx tsc --noEmit` printed 16 error lines. Recording those results in the measurement file mattered more than presenting the matcher as fully proven.

I also learned that production constraints change design decisions. LinkedIn extraction that worked locally timed out or hit rate limits on Vercel, and the database pool exhausted under serverless concurrency. Fixing those required guest-first extraction, skipping Playwright for LinkedIn on Vercel, and `connection_limit=1` on the pooled URL — not another UI polish pass.

Finally, I learned that multilingual UI labels need a persistence policy, not only a translate button. Thai tags such as `การคิดวิเคราะห์` stayed in the database until we normalized them to English on save and on load. A label that looks fine in one panel can still leak Thai somewhere else if storage is not English by default.

## 4. Evidence

| Contribution | Link |
| --- | --- |
| Repository bootstrap | [217869c](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/217869c6f69097a78936746e2d4dcef1dd5d296c) |
| Requirements and design documentation | [8ad53cb](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/8ad53cb281d5eb0c9dd3cddb1c000cd76e6222df) |
| Technical documentation and server helpers | [3ac6a72](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/3ac6a727d7d5e3fcb82f91f401f82119bb4bb34d) |
| Resume matching and internship workflow | [ecfff15](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/ecfff15895e315dbb76131b9fc02a5b3e711c7f5) |
| AI match calculation | [34c8d7a](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/34c8d7aef3cae9c26ba6ff6684f675d338ae56a5) |
| Skill-match explanations, gap recommendations, UI polish | [591bb44](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/591bb44a8fe817bb2da3762f0ba0034793315e3e) |
| Documentation and gap fixes | [ad42187](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/ad42187fe181bb344b5db3bd6c5fd371d44fd0e9), [e37f341](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/e37f3415aa86da9025bb82acd681d582133527a5), [219cf7d](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/219cf7de59f7bbbd2fa791f03986b1920427bb56) |
| Vercel build and production hardening (English labels, live URL) | [1ff75f7](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/1ff75f7d8b98d39d3bad9327d5c8022c0667e663), [f7f4382](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/f7f4382175a2f84affb06960b6efc4671f2845cc) |
| Tech Lead review of README and CLAUDE.md | [23 September 2026 log](../../05-log/20260923-log.md) |
| Charter role | [Company charter](../../discover/company-charter.md) |
| Match percentage and Gemini wording limits | [AI logic](../ai-logic.md) |
| 17 November 2026 command results | [Measurement results](../../test/measurement-results.md) |
| Live system | [https://intern-track-smart-internship-jobs.vercel.app/](https://intern-track-smart-internship-jobs.vercel.app/) |

## 5. AI disclosure

| AI tool | What I used it for | How I checked the output |
| --- | --- | --- |
| ChatGPT | Review support while checking the root README and `CLAUDE.md` ([23 September 2026 log](../../05-log/20260923-log.md)) | Compared the drafts against setup steps, team rules, and the specification; the log notes that specific AI contribution lines were not recorded in detail |
| Cursor / coding agents | Drafting production fixes (Vercel Prisma pooling, URL extraction, English tag normalization) and documentation wording | Ran builds and redeploys, checked ownership and English-label behavior against the live app, and kept failures such as the matching script result in the measurement file |

## 6. Reflection

### 6.1 Lessons learned: How did building the app with AI affect software engineering?

Building InternTrack with AI made technical integration faster, but it did not replace architecture judgment. As Tech Lead, I used AI to draft route and persistence changes, smoother prompts, and deployment notes. That saved time on boilerplate and let me focus on the student workflow: extract as a draft, review, then save only after an explicit action.

The risk was mistaking fluent output for correct system behavior. A matching helper can return 100 while a verification script still fails. A Vercel deploy can succeed while LinkedIn extraction times out. AI drafts also needed careful ownership checks so we never treated a shared demo identity as real authentication. Software engineering in this project still meant tracing requirement → backlog → code → verification, and refusing to call unfinished work Accepted.

### 6.2 Where do I stand in the software industry today, in the AI era?

I see myself as a Tech Lead in training who must stay accountable for integration decisions. AI can propose schema fields, API shapes, and error messages, but I still need to know why a pooled database URL needs `connection_limit=1`, why credentials stay server-side, and why a Thai tag in storage will reappear in the UI. In the AI era, strong foundations in architecture, security, and evidence recording are what let me challenge a suggestion instead of shipping it blindly.

### 6.3 What is my plan for next year and the next five years?

Next year I want to deepen backend and full-stack practice: authentication, data modeling, and reliable deployment for real users, not only demo environments. I also want to improve how I document limits so teammates and reviewers can see what was proven and what was not.

Over the next five years I hope to grow into a software engineer who can lead technical delivery with clear ownership — someone who uses AI as an accelerator while still explaining trade-offs, protecting personal data, and standing behind the evidence behind every claim.

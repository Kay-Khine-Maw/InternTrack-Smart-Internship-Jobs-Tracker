# Role Statement — Nang Yu Yu Khay (6631503078)


**Role:** Product Owner


## 1. What I owned


As Product Owner, I owned problem framing, scope, requirements, product decisions, and the presentation narrative for InternTrack. I kept Must and deferred items clear in the specification and backlog so the team would not treat unfinished work as Accepted.


## 2. What I did


I wrote and revised the requirements documents (939b691) and the backlog revision (9cf570b), then merged the Product Owner pull request (42045de). I also contributed reusable application components such as internship cards, layout, dialogs, and shared UI files (eb15f05).


On 20 September 2026 I reviewed the specification for product scope, requirements, and problem statements. On 21 September 2026 I reviewed backlog priorities, stories, dependencies, and traceability. Both reviews used Claude; the logs note that specific AI contribution lines were not recorded in detail.


The specification still marks Must items for profile, capture, extraction, review, save, duplicates, priority, documents, dates, and authentication. Application-status tracking remains deferred. Five structured interview responses exist; they are not a timed before/after study, and no requirement item is marked Accepted in this statement.


## 3. What I learned


I learned that Product Owner work is incomplete until scope limits are visible. Saying “Must” without saying what is deferred invites readers to assume status tracking or full acceptance. Keeping application-status deferred in the specification protected the team from over-claiming.


I also learned that interview evidence is not the same as a timed usability study. We have five structured responses and questionnaire means, but before-and-after task times were not measured. A Product Owner has to label that gap clearly so presentation numbers stay honest.


Finally, I learned that reusable UI components still need product rules. Cards and dialogs can look finished while Save-after-review and ownership checks remain the real product behavior. Components support the narrative; they do not replace the acceptance criteria.


## 4. Evidence


| Contribution | Link |
| --- | --- |
| Requirements documents | [939b691](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/939b691fb1e5cc64d996721bf59965b86adfba79) |
| Backlog revision | [9cf570b](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/9cf570b152edd7b1dc87c5aeec9ec3978e6d06ce) |
| Product Owner pull-request merge | [42045de](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/42045de4a2e234e712189bbb1865132057bb00e8) |
| Reusable application components | [eb15f05](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/eb15f052a07e8831536e5616babf8f219f83f32e) |
| Specification review | [20 September 2026 log](../../05-log/20260920-log.md) |
| Backlog priorities and traceability review | [21 September 2026 log](../../05-log/20260921-log.md) |
| Charter role | [Company charter](../../discover/company-charter.md) |
| Specification | [spec.md](../../01-requirements/spec.md) |
| Backlog | [backlog.md](../../01-requirements/backlog.md) |
| Interview evidence | [interview-transcripts.md](../../discover/interview-transcripts.md) |
| Questionnaire means | [SUS](../../test/sus-results.md), [TAM](../../test/tam-results.md), [UTAUT2](../../test/utaut2-results.md) |


## 5. AI disclosure


| AI tool | What I used it for | How I checked the output |
| --- | --- | --- |
| Claude | Support while reviewing the specification ([20 September 2026 log](../../05-log/20260920-log.md)) | Compared drafts against product scope, problem statements, and Must versus deferred items; specific contribution lines were not recorded in the log |
| Claude | Support while reviewing backlog priorities and traceability ([21 September 2026 log](../../05-log/20260921-log.md)) | Checked stories, dependencies, and links to requirements; kept deferred status tracking and unaccepted items visible |


## 6. Reflection


### 6.1 Lessons learned: How did building the app with AI affect software engineering?


Building InternTrack with AI made drafting requirements and backlog text faster, but Product Owner judgment still decided what was in scope. AI could propose user stories and acceptance wording; I still had to refuse claims that were not backed by interviews or verification.


The danger was polished language that sounded finished. A complete-looking backlog line does not mean the feature is Accepted. Software engineering on this project needed clear labels for deferred work, proxy evidence, and unmeasured times so the presentation narrative matched the repository.


### 6.2 Where do I stand in the software industry today, in the AI era?


I see myself as a Product Owner who must keep evidence and claims aligned. AI can draft problem statements and presentation text, but without strong requirements skill I could ship a story that sounds right and fails users. In the AI era, my value is asking what was proven, by whom, and in which environment.


### 6.3 What is my plan for next year and the next five years?


Next year I want to practice product discovery with clearer measurement plans: when we interview, when we time tasks, and how we decide Must versus Should. I also want to improve how I write acceptance criteria so engineers and QA can verify them without guessing.


Over five years I hope to grow into a product role where I can lead scope decisions with honest evidence, use AI for drafting speed, and still take responsibility for what the team promises users.
# Role Statement — Nway Nway Zay Ya (6631503081)


**Role:** AI Lead


## 1. What I owned


As AI Lead, I owned Gemini integration, extraction and translation behavior, normalization of AI responses, and explainable matching for InternTrack. I also reviewed legal and processing safeguards in rule.md so external AI calls stayed inside the project rules.


## 2. What I did


I added application pages and API routes (e6223b1) and the extraction stack (5bbf342), including web/lib/ai/internshipExtractor.ts, web/lib/ai/translateText.ts, the extract and translate routes, and the URL, PDF, DOCX, and image extractors. I also merged the AI Lead pull request (2918598).


On 22 September 2026 I reviewed rule.md, extraction, and external AI processing as AI Lead. That review used ChatGPT; the log notes that specific AI contribution lines were not recorded in detail.


I do not claim extractor lines from the Crystal-stillalive commit (b686215). That author is not in the company charter. Current text extraction may fall back to OpenAI when GEMINI_API_KEY is missing and OPENAI_API_KEY is set, which matches F3 and CLAUDE.md. Translation reads only the Gemini key. The on-screen match percentage is deterministic; Gemini may smooth later explanation sentences only. The matching verification script failed on 17 November 2026 with 100 !== null, and this statement does not claim that script passed.


## 3. What I learned


I learned that AI Lead ownership means separating model output from product truth. Extraction returns a draft; the student must review and Save. Treating a fluent Gemini response as a saved internship would break the core workflow.


I also learned that explainable matching needs a deterministic percentage. If Gemini owned the score, we could not explain “why this percentage” from skill and tool counts. Keeping the first sentence and percentage in application code, and limiting Gemini to later wording, made failures easier to reason about when the smoother was unavailable.


Finally, I learned that provider fallbacks must be named honestly. Allowing OpenAI for text extraction when Gemini is absent is not the same as “Gemini only” for every AI feature. Translation stays Gemini-only; documentation that blurs those paths misleads reviewers.


## 4. Evidence


| Contribution | Link |
| --- | --- |
| Application pages and API routes | [e6223b1](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/e6223b19ab5112c2159b89981596036299716fb8) |
| Extraction and translation files | [5bbf342](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/5bbf3421e91695336f4625e5e2469d478c994964) |
| AI Lead pull-request merge | [2918598](https://github.com/Kay-Khine-Maw/InternTrack-Smart-Internship-Jobs-Tracker/commit/291859824d6baea2fda266956888e41e0cd8580f) |
| Review of rule.md and extraction safeguards | [22 September 2026 log](../../05-log/20260922-log.md) |
| Charter role | [Company charter](../../discover/company-charter.md) |
| AI behavior and limits | [AI logic](../ai-logic.md) |
| Legal and processing rules | [rule.md](../../../rule.md) |
| Agent and provider guidance | [CLAUDE.md](../../../CLAUDE.md) |
| Matching script result (failed assertion) | [Measurement results](../../test/measurement-results.md) |


## 5. AI disclosure


| AI tool | What I used it for | How I checked the output |
| --- | --- | --- |
| ChatGPT | Support while reviewing rule.md, extraction, and external AI processing ([22 September 2026 log](../../05-log/20260922-log.md)) | Compared guidance against PDPA-oriented rules, draft-before-save behavior, and Gemini versus OpenAI boundaries; specific contribution lines were not recorded in the log |
| Gemini (product feature) | Structured extraction, English translation, match-explanation smoothing, and skill-gap wording in the running app | Kept output as editable drafts, preserved originals when translating, and documented that the match percentage is not taken from Gemini |


## 6. Reflection


### 6.1 Lessons learned: How did building the app with AI affect software engineering?


Building InternTrack around Gemini changed how we design features: minimize what we send, normalize missing fields, and never invent absent facts. AI sped up extraction and translation drafts for students, which is the product value.


It also raised the cost of weak verification. An empty extract verification script that exits 0 does not prove extraction quality. A matching script that fails on score expectations shows that AI-adjacent features still need ordinary software tests. Engineering with AI providers means treating model output as untrusted input at the system boundary.


### 6.2 Where do I stand in the software industry today, in the AI era?


I see myself as an AI-focused engineer who must still understand routes, prompts, and failure modes. Using Gemini without knowing when OpenAI fallback applies, or when a percentage is deterministic, would leave gaps I cannot explain. In the AI era, my responsibility is to make model behavior inspectable and reversible for users.


### 6.3 What is my plan for next year and the next five years?


Next year I want stronger evaluation habits for extraction and translation: sample sets, failure cases, and clear pass/fail notes beyond “script exited 0.” I also want deeper practice with prompt constraints and safety rules for personal data.


Over five years I hope to work as an engineer who integrates AI into real products carefully — fast enough to help users, strict enough to keep drafts editable, secrets off the client, and claims matched to measured evidence.

# Role statement — Nway Nway Zay Ya

**Student ID:** 6631503081  
**Charter role:** AI Lead. The charter assigns Gemini integration, extraction and translation behavior, normalization, and explainable matching. This statement is not acceptance, and it has no reflection section.

Git on `main` records Nway Nway Zay Ya and nwaynwayzayya as the author of application pages and API routes (`e6223b1`) and of extraction files (`5bbf342`), plus the AI Lead pull-request merge (`2918598`). The extraction commit includes `web/lib/ai/internshipExtractor.ts`, `web/lib/ai/translateText.ts`, the extract and translate routes, and the URL, PDF, DOCX, and image extractors. The 22 September 2026 log names Nway as reviewer of `rule.md`, extraction, and external AI processing. That log names ChatGPT and says the specific contributions were not recorded.

An earlier commit by Crystal-stillalive (`b686215`) also added extractor files. That author is not in the charter, so those lines are not claimed here as Nway's. Current text extraction still falls back to OpenAI when the Gemini key is missing and an OpenAI key is set. That matches the text-extraction fallback allowed in `CLAUDE.md` and F3. Translation in `translateText.ts` reads only the Gemini key. The match percentage on disk is deterministic. The matching script failed on 17 November 2026 with `100 !== null`. This statement does not claim that script passed. No further personal AI diary is stored.

## Evidence

- [Company charter](../../discover/company-charter.md)
- [22 September 2026 log](../../05-log/20260922-log.md)
- [AI logic](../ai-logic.md)
- [rule.md](../../../rule.md)
- [CLAUDE.md](../../../CLAUDE.md)
- Commits: `e6223b1`, `5bbf342`, `2918598`

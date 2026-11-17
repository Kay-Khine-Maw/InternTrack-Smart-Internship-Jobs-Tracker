# Problem and Usability Research Findings

## Status

Five anonymized pre-test and post-test interview responses are available:
U01–U05. Moderated app sessions and interview recordings were completed on **17
November 2026** ([Software Case studies — Interview videos](https://drive.google.com/drive/folders/1DaICWCtuZTEzS48CV5_QI3aj0sFiQPjZ?usp=sharing)).
Task completion is in [session-log.md](../test/session-log.md). Observed task
times were not measured. Questionnaire means are in the result files named below.
They are not a timed before/after study.

Source: [interview-transcripts.md](interview-transcripts.md).

## Participant evidence

- U01: scattered links and screenshots; wanted one place and clearer draft-save
  state.
- U02: difficulty understanding formal Thai job descriptions; translation
  reduced manual work but some wording sounded unnatural.
- U03: uncertainty about whether electronics and PCB skills matched a job;
  requirements were easier to find but skill matching was still wanted.
- U04: uncertainty about which networking, Linux or security skills to learn;
  requirements were easier to see but learning recommendations were wanted.
- U05: long job descriptions made SQL and Python requirements difficult to find;
  extracted information was sometimes incomplete.

## Transcript-supported findings

### Current-process pains

- **Scattered sources and notes:** U01 used saved posts/screenshots, U02 and
  U04 copied links into notes, U03 bookmarked links and U05 used screenshots.
- **Deadline tracking is fragmented:** participants used phone notes, Google
  Calendar, phone reminders or notes.
- **Understanding and prioritizing requirements is difficult:** U02, U03, U04
  and U05 described language, matching, learning-priority or information-
  discovery problems.

### Post-test reactions

- 5 of 5 response records said the reviewed flow or duplicate warning helped.
- 5 of 5 response records described an improvement in organizing, translating or
  finding important details.
- 5 of 5 response records said extraction was mostly trustworthy but checked the
  original source.

### Limitations and requested extensions

- Draft-save state needs to be clearer: U01.
- Translation quality needs review and correction: U02.
- Skill matching is wanted: U03.
- Learning recommendations are wanted: U04.
- Extraction completeness remains a concern: U05.

## Requirement implications

- F2–F5 and F6 are supported as relevant workflow needs by these responses.
- F4 review/correction is especially important because every response record still
  checked the original source.
- F11 translation is relevant to U02, but naturalness must be evaluated.
- F14 matching is relevant to U03. The current match panel also shows skill-gap
  cards, which relates to U04's request for learning recommendations. The
  transcripts do not prove that either behavior works. See
  [MatchPanel.tsx](../../web/components/internships/MatchPanel.tsx).
- No transcript proves task success, performance improvement or population-wide
  demand.

## Before/after summary

- Baseline: participants used scattered links, screenshots, bookmarks, notes,
  phone reminders or Google Calendar.
- After reaction: participants described one-place organization, easier
  translation or faster requirement discovery.
- Quantitative task timing: **not measured**.
- Independent task completion: **not supplied** in this findings note.
- Error/omission counts: **not supplied**.
- SUS: mean **72 / 100**, five people. Source: [sus-results.md](../test/sus-results.md).
- TAM: usefulness **4.13 / 5**, ease of use **3.67 / 5**, intention to use **3.87 / 5**, five people. Source: [tam-results.md](../test/tam-results.md).
- UTAUT2: PE **4.20**, EE **3.60**, SI **3.40**, FC **4.30**, HM **3.50**, BI **4.00**, five people. Price value and habit were not scored. Source: [utaut2-results.md](../test/utaut2-results.md).

## Evidence boundary

These are descriptive findings from five supplied transcripts, plus the
questionnaire means above. They are not a timed before/after study and not a
claim about all students. Task times remain unmeasured.

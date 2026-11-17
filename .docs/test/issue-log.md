# Test Issue Log

Record issues found during testing. “Fix commit” must contain a real commit
reference after the fix is pushed. Do not mark an issue retested without output.

## Issue template

- Issue ID:
- Date found:
- Found by:
- Severity: Critical / High / Medium / Low
- Requirement/backlog trace:
- Steps to reproduce:
- Expected:
- Actual:
- Evidence:
- Status: Open / Fixed / Retest passed / Accepted
- Fix commit:
- Retest date:
- Retest command or session:
- Retest result:

## Known issues to register

The following were observed during the repository check and require verification
after correction:

- TypeScript failures caused by removed application-status types.
- Dashboard `MapIterator` target/type-check failure.
- Production build failure during type checking.
- Production dependency vulnerabilities from `npm audit --omit=dev`.
- Database migration status unavailable until local credentials are corrected.

## Interview-derived observations

These are observations from U01–U05, not confirmed implementation defects.
Create a separate issue or product decision if the team accepts them as work.

- **UX-OBS-01:** U01 was unsure when the extraction draft was saved.
- **AI-OBS-01:** U02 found some translated words unnatural.
- **PRODUCT-OBS-01:** U03 wanted a skill-match feature.
- **PRODUCT-OBS-02:** U04 wanted learning recommendations.
- **AI-OBS-02:** U05 encountered incomplete extracted information.

For each accepted item, add severity, owner, fix commit and retest evidence.

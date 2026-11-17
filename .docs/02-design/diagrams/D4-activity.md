# D4 — Core Workflow Activity Diagram

## Scope

This diagram shows the whole system's core workflow:

Sign up or sign in → capture → extract → review → save → reopen.

It includes decisions, cancellation and failure paths.
Supporting workflows are described in the user journey and D2.
Application-status tracking remains deferred; priority, checklist, dates,
search, translation and deletion follow the same authorization rules.

Implementation and acceptance status remain in the backlog.

## Activity Diagram

```mermaid
flowchart TD
    Start(( )) --> Session{"Valid session?"}

    Session -->|Yes| Capture
    Session -->|No| SignIn("Sign in or sign up")
    SignIn --> AuthResult{"Authentication successful?"}
    AuthResult -->|No| AuthError("Show sign-in error")
    AuthError --> SignIn
    AuthResult -->|Yes| Capture

    Capture("Provide URL or supported file") --> InputCheck{"Input valid and permitted?"}
    InputCheck -->|No| InputError("Show validation error")
    InputError --> Capture
    InputCheck -->|Yes| Extract("Process source with Gemini")

    Extract --> ExtractResult{"Usable draft returned?"}
    ExtractResult -->|No| ExtractError("Show extraction error")
    ExtractError --> Retry{"Try again?"}
    Retry -->|Yes| Capture
    Retry -->|No| Cancel

    ExtractResult -->|Yes| Review("Review and correct draft")
    Review --> ReviewChoice{"Student action?"}

    ReviewChoice -->|Cancel| Cancel("Cancel without creating an internship")
    Cancel --> History("Handle extraction history under retention rules")
    History --> Finish((( )))

    ReviewChoice -->|Save| Access{"Session and record references authorized?"}
    Access -->|No| AccessError("Reject save and explain access failure")
    AccessError --> Reauth{"Sign in again?"}
    Reauth -->|Yes| SignIn
    Reauth -->|No| History

    Access -->|Yes| Fields{"Reviewed fields valid?"}
    Fields -->|No| FieldError("Show field errors")
    FieldError --> Review

    Fields -->|Yes| DuplicateCheck("Evaluate duplicate policy within Student records")
    DuplicateCheck --> CheckResult{"Duplicate check result?"}

    CheckResult -->|Failed| CheckError("Show check failure; do not save")
    CheckError --> Review

    CheckResult -->|No duplicate| Save
    CheckResult -->|Possible duplicate| DuplicateChoice{"Student decision?"}

    DuplicateChoice -->|Return to review| Review
    DuplicateChoice -->|View existing| Load
    DuplicateChoice -->|Override this save| Revalidate("Revalidate session, fields and references")
    Revalidate --> OverrideValid{"Override request valid?"}
    OverrideValid -->|No| OverrideError("Reject request and show error")
    OverrideError --> Review
    OverrideValid -->|Yes| Save

    Save("Persist record and related data consistently") --> SaveResult{"Persistence successful?"}
    SaveResult -->|No| SaveError("Show save failure; preserve recoverable draft")
    SaveError --> Review

    SaveResult -->|Yes| Confirm("Confirm save and display record")
    Confirm --> Reopen("Reload or reopen record")
    Reopen --> Load("Verify session and requested record ownership")

    Load --> ReadAccess{"Access allowed?"}
    ReadAccess -->|No| Denied("Show sign-in or access message")
    Denied --> Finish

    ReadAccess -->|Yes| Read("Load saved record")
    Read --> ReadResult{"Record loaded?"}
    ReadResult -->|No| ReadError("Show unavailable-record or read error")
    ReadError --> Finish
    ReadResult -->|Yes| Display("Display persisted values")
    Display --> Finish

    classDef initial fill:#222,stroke:#222,color:#222;
    classDef final fill:#222,stroke:#222,color:#222;
    class Start initial;
    class Finish final;
```

## Rules

- Protected actions require server-side session checks.
- Record references must belong to the authorized Student.
- Extraction creates a draft, not a saved internship.
- An extraction-time duplicate warning returns to review.
- Only an explicit final Save begins persistence.
- An override does not bypass validation or authorization.
- Failed operations must not appear successful.
- Retries must not create unintended duplicate records.
- Cancellation does not automatically delete extraction history.

## Supporting Workflows

Profile, tracking, checklist, calendar, search, translation and deletion follow the same authorization and error-handling rules.

They remain separate from this core activity flow.

## Traceability

- F2–F3: Capture and extraction.
- F4: Review and cancellation.
- F5: Save and reopen.
- F6: Duplicate decisions.
- F13: Authentication and session access.
- NFR1–NFR3: Reliability, validation and security.
- LR2: External AI processing.
- LR4: Ownership.
- LR8: Retention.

## Notation

- Filled circle: start.
- Rounded rectangle: action.
- Diamond: decision.
- Labeled arrows: decision outcomes.
- Double-circle approximation: end.

Mermaid flowchart shapes approximate an activity diagram.
Use a dedicated UML tool if exact UML notation is required.

## Related Documents

- [Specification](../../01-requirements/spec.md)
- [User journey](../user-journey.md)
- [D2 use cases](D2-use-case.md)
- [D3 architecture](D3-architecture.md)
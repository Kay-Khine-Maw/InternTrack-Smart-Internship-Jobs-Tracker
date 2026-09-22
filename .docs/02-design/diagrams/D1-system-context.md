# D1 — InternTrack System Context

Scope: InternTrack includes its database; external AI providers and posting websites sit outside its boundary.

```mermaid
flowchart LR
    Student["Student user"]
    System["InternTrack web application<br/>Capture, review and track internship applications"]
    Websites["External internship websites"]
    Gemini["Gemini API<br/>Preferred AI provider"]
    OpenAI["OpenAI API<br/>Optional text provider"]
    Student -->|"Provides posting URL or PDF, DOCX, PNG, JPG; reviews and manages records"| System
    System -->|"Displays extracted fields, application progress and calendar"| Student
    System -->|"Requests posting content"| Websites
    Websites -->|"Returns page content"| System
    System -->|"Sends source text or image; requests extraction or translation"| Gemini
    Gemini -->|"Returns structured fields or translated text"| System
    System -->|"Sends text requests when selected by configuration"| OpenAI
    OpenAI -->|"Returns extraction or translation results"| System
```

The student supplies files; a file is an input, not a separate human actor. Employers do not operate InternTrack in the current scope. Applying to an employer occurs outside this system. Authentication, automatic application submission and outbound reminders are not included in this baseline.

Evidence: `README.md`; `.docs/01-requirements/spec.md` F1–F12 and scope exclusions; `web/app/api/extract/route.ts`.
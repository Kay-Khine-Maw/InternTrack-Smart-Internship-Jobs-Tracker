# D2 — InternTrack Use Cases

Mermaid flowchart notation represents actors, oval use cases and the system boundary. This is a use-case view, not a sequence of screens.

```mermaid
flowchart LR
    Student["Student"]
    AI["External AI provider<br/>Gemini / optional OpenAI"]
    Site["Posting website"]
    subgraph InternTrack["InternTrack"]
        Profile(["Manage profile"])
        Capture(["Capture posting from URL or file"])
        Extract(["Extract internship details"])
        Review(["Review and correct draft"])
        Translate(["Translate supported fields into English"])
        Save(["Save reviewed internship"])
        Duplicate(["Check for duplicates unless explicitly overridden"])
        Pipeline(["Browse, search and filter internships"])
        Manage(["Update status, priority, notes and dates"])
        Checklist(["Manage document checklist"])
        Calendar(["View deadlines, follow-ups and interviews"])
        Delete(["Delete internship after confirmation"])
    end
    Student --- Profile
    Student --- Capture
    Student --- Review
    Student --- Save
    Student --- Pipeline
    Student --- Manage
    Student --- Checklist
    Student --- Calendar
    Student --- Delete
    Capture -.->|"include"| Extract
    Translate -.->|"extend: user requests translation"| Review
    Save -.->|"include"| Duplicate
    AI --- Extract
    AI --- Translate
    Site --- Capture
```

- Capture/extract/review/save: F2–F6.
- Profile: F1. Lifecycle and preparation: F7–F8. Calendar: F9.
- Browsing: F10. Optional translation: F11. Deletion: F12.
- A duplicate warning allows viewing the existing record or explicitly adding another. Translation is optional; reviewing before saving is part of the core workflow.
- Document checklist entries represent preparation tasks, not a document-storage service. No login or email-reminder use case is claimed for the demo build.

Evidence: `.docs/01-requirements/spec.md`; `web/app/api/internships/route.ts`; `web/prisma/schema.prisma`.

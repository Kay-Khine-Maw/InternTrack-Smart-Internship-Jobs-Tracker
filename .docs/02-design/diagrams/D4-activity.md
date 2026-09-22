# D4 — Capture, Review and Save an Internship

The core automation extracts and structures a supplied posting. The student still initiates capture and reviews the result before saving.

```mermaid
flowchart TD
    Start(("Start")) --> Input["Student pastes URL or uploads a file"]
    Input --> Kind{"Source type?"}
    Kind -->|"URL"| URL["Fetch page and extract text"]
    Kind -->|"PDF or DOCX"| File["Validate upload and extract text"]
    Kind -->|"PNG or JPG"| Vision["Validate upload and attempt AI vision"]
    Kind -->|"Unsupported or empty"| Error["Show actionable error"]
    URL --> TextOK{"Readable source?"}
    File --> TextOK
    TextOK -->|"No"| Error
    TextOK -->|"Yes"| History["Create extraction-history record"]
    Vision --> VisionOK{"Usable vision result?"}
    VisionOK -->|"No"| OCR["Run OCR"]
    OCR --> TextOK
    VisionOK -->|"Yes"| History
    History --> HistoryOK{"History saved?"}
    HistoryOK -->|"No"| Error
    HistoryOK -->|"Yes"| NeedAI{"Structured result already available?"}
    NeedAI -->|"No"| AI["Run structured AI text extraction"]
    AI --> AIOK{"Extraction succeeds?"}
    AIOK -->|"No"| Error
    AIOK -->|"Yes"| Normalize["Normalize fields and enrich from source text"]
    NeedAI -->|"Yes"| Normalize
    Normalize --> Draft["Attempt AI-history update; check URL duplicate;<br/>display draft and any warning"]
    Draft --> Review["Student reviews, corrects and optionally translates fields"]
    Review --> Decision{"Student decision?"}
    Decision -->|"Cancel"| Cancel["Discard draft; extraction history remains"]
    Cancel --> End(("End"))
    Decision -->|"Save"| Validate{"Required fields valid?"}
    Validate -->|"No"| Review
    Validate -->|"Yes"| Check["Server checks URL or company-and-position duplicate"]
    Check --> Exists{"Duplicate found?"}
    Exists -->|"Yes"| Choice{"Student chooses"}
    Choice -->|"View existing"| Existing["Open existing internship"]
    Existing --> End
    Choice -->|"Return to editing"| Review
    Choice -->|"Add anyway"| Save["Create internship, checklist and tag links;<br/>link history and save additional fields"]
    Exists -->|"No"| Save
    Save --> Saved{"Server confirms success?"}
    Saved -->|"Yes"| Track["Show saved internship for ongoing tracking"]
    Track --> End
    Saved -->|"No"| SaveError["Show save error; check existing records before retry"]
    SaveError --> End
    Error --> Retry{"Retry with corrected input?"}
    Retry -->|"Yes"| Input
    Retry -->|"No"| End
```

The initial URL duplicate check provides early feedback; the save endpoint also checks duplicates unless the user explicitly overrides. Company and position are required. Uploads are limited to 10 MB in the extraction handler.

Persistence comprises multiple operations in the current save handler, not one enclosing transaction. A late failure can occur after the internship was created, so an error does not guarantee that nothing was saved. AI-history snapshot updates are best-effort. The diagram reflects these limits rather than promising atomic persistence.

Evidence: `web/app/api/extract/route.ts`; `web/app/api/internships/route.ts`; `.docs/01-requirements/spec.md` F2–F6.

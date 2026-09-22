# InternTrack Proposal

## Project Title
InternTrack

## Overview
InternTrack is a university student internship tracking application that helps users collect internship opportunities, extract relevant details from job pages and uploaded documents, review the extracted information, and manage each application from first interest to final decision.

The system is designed for students who are applying to multiple internships at the same time and need a single place to organize deadlines, required documents, interviews, follow-ups, and application status.

## Problem
Students often manage internships across multiple channels such as job boards, emails, PDFs, notes, and spreadsheets. This creates several problems:

- application details are scattered across different sources
- manually copying job information is slow and error-prone
- important deadlines and follow-ups are easy to miss
- required documents and tasks are not always tracked clearly
- students may lose track of which applications are active, preparing, or under review

The result is a fragmented application process that increases stress and reduces focus on high-priority opportunities.

## Solution
InternTrack provides a centralized workflow for internship management. Students can:

- add an internship from a URL or uploaded file
- extract structured information automatically from the source
- review and correct the extracted fields before saving
- track each application by status, priority, notes, and timeline
- monitor interview dates, deadlines, and follow-up tasks
- manage required documents and preparation tasks in one place

The platform reduces manual work while preserving user control over the final saved record.

## Objectives

### Primary objectives
- help students organize internship applications more effectively
- reduce time spent manually entering internship details
- improve visibility of application deadlines and follow-up actions
- make the application pipeline easier to manage across multiple roles

### Secondary objectives
- support document intake from common file types
- allow AI-assisted extraction and translation for review
- show application status and progress in a clear dashboard
- support future expansion toward richer reminders and more advanced personalization

## Target Users

### Primary users
- university students searching for internships
- students managing multiple applications in parallel
- students who need a structured way to track deadlines and interviews

### Secondary users
- career-support or academic staff who may review a student’s workflow in future versions
- product stakeholders who need a clear application pipeline and data model

## User Needs
Students need a system that:

- is fast to use when adding a new internship
- reduces repetitive manual data entry
- supports updates as applications evolve
- keeps important dates visible at a glance
- prevents duplicate or fragmented tracking records
- helps them stay organized without switching between multiple tools

## Proposed Features

### Core features
- internship dashboard with status overview
- add internship from URL or uploaded file
- structured extraction of company, role, deadline, location, and requirements
- review and correction workflow before saving
- saved internship list and detail pages
- status tracking for application stages
- deadline, interview, and follow-up tracking
- required document checklist
- duplicate detection warnings
- profile management
- calendar view for upcoming actions

### Advanced features
- English translation of supported extracted fields
- AI-assisted extraction with correction workflow
- visual priority and timeline tracking
- future reminder and notification support

## System Overview
The application is implemented as a full-stack web system using Next.js, TypeScript, Prisma, and PostgreSQL.

The main layers are:

- frontend interface for dashboard, add-internship, detail, calendar, and profile workflows
- server-side route handlers for extraction, internship management, profile updates, and translation
- extraction services for URL, PDF, DOCX, and image-based content
- AI adapters for structured data extraction and translation
- PostgreSQL database managed through Prisma

This architecture allows the system to support real data persistence and user workflow management without exposing database access directly to the browser.

## Proposed Functional Flow
1. User opens the dashboard.
2. User chooses to add a new internship.
3. User pastes a job URL or uploads a document.
4. System extracts the content and identifies relevant fields.
5. User reviews the generated data and makes necessary edits.
6. User saves the internship to the tracking system.
7. User updates application status and follow-up tasks over time.
8. User monitors deadlines and interviews using the dashboard and calendar.

## Business Value
InternTrack creates value by helping students manage internships more efficiently and with less cognitive overload. The product turns scattered and informal tracking into a structured workflow that supports decision-making and deadline management.

For students, the benefit is practical: fewer missed opportunities, easier coordination, and a more organized application pipeline.

## Feasibility
The project is feasible with the current technology stack and repository structure. The app already includes:

- a Next.js web application
- PostgreSQL and Prisma setup
- extraction services for multiple file types
- AI-based field mapping
- internship dashboard and detail management
- calendar-based planning support

The system is therefore positioned as a realistic MVP for internship tracking with room for future enhancement.

## Risks and Considerations

### Technical risks
- AI extraction may produce incomplete or inaccurate data
- document parsing quality may vary by source format
- provider availability and API limits may affect reliability

### Product risks
- requirements are still evolving and may need validation with real student feedback
- privacy rules require careful handling of uploaded documents and extracted data

### Operational considerations
- authentication and user ownership boundaries are not yet production-ready
- retention and deletion policy decisions still need formal definition
- production logging and privacy disclosures must be implemented before deployment

## Proposed Scope for Current Build
The initial build should focus on the product’s core value proposition:

- internship intake from URL or file
- AI-assisted extraction and user review
- save and update internship records
- status, deadline, interview, and document tracking
- dashboard and calendar overview

This scope delivers the main user value while remaining technically achievable within the existing project structure.

## Expected Outcome
The expected result is a student-friendly internship tracker that helps users manage applications with less effort, less clutter, and more visibility into what needs attention next.

InternTrack is intended to become a reliable personal application pipeline that supports planning, follow-up, and decision-making throughout the internship search process.

## Conclusion
InternTrack addresses a common but under-supported student problem: the difficulty of managing internships across many sources and tools. By combining collection, extraction, review, status tracking, and planning in one application, it creates a practical solution for students who need structure while applying to internships.

The project is viable as a focused MVP and provides a strong foundation for future enhancements such as reminders, analytics, and more advanced personalization.

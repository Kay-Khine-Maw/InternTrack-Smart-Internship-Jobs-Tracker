# InternTrack — Prototype

## Overview

This prototype presents a centralized internship tracking experience for university students. It helps students collect internship opportunities, extract key details from job pages or uploaded documents, review the generated information, and manage each application through the stages from save to decision.

The prototype reflects the current InternTrack product concept and demonstrates the main user journey of the application.

[Open the Figma prototype](https://www.figma.com/make/CHGXQRRC6fiLTbwoueLiEe/InternTrack-web-app?t=jzakXBG54WLjMRPG-20&fullscreen=1)

## Purpose

The design addresses four main challenges:

- Students often track internships across multiple websites, notes, and spreadsheets.
- Important information such as company name, deadline, location, and application link is not always easy to capture consistently.
- Application progress and interview preparation are hard to manage when several roles are being considered at once.
- Students need a single place to review AI-extracted data and keep follow-up actions organized.

InternTrack is designed to reduce this complexity by centralizing internship management in one workflow.

## Main Screens

### 1. Login

The entry screen presents a simple sign-in experience for the demo user flow. The interface shows a basic authentication form with a username and password, alongside a demo-access option for testing the prototype.

This represents a front-door entry point to the system and does not imply a full external university authentication integration.

### 2. Dashboard / Home

The dashboard gives students an overview of their internship pipeline. It includes:

- A quick action to add a new internship
- A summary of tracked applications
- Status counts across the application workflow
- Current opportunities and upcoming deadlines
- A space for viewing the user’s active internship portfolio

The prototype can show an empty state when no internships have been added yet.

### 3. Add Internship

The add-interview flow allows users to bring in internship information in two ways:

- Paste a job posting URL
- Upload a file such as PDF, DOCX, PNG, or JPG

The system extracts text from the source and prepares structured internship data for review. This reduces manual entry while keeping the user in control of corrections.

## Internship Intake Flow

**Source → Extract → Review → Save**

1. Enter a job URL or upload a document.
2. The system extracts the text and identifies important details.
3. The application reads fields such as company, role, location, deadline, requirements, skills, and contact details.
4. The user reviews and corrects missing or inaccurate values.
5. The internship is saved into the personal tracking system.
6. The student can continue managing the role from the dashboard and detail view.

The extraction flow is designed for speed and accuracy, while preserving the ability to edit AI-generated data before saving.

## Internship Detail and Review

The review screen displays the structured internship record in a form-based layout. Users can inspect and update fields such as:

- Company name
- Position title
- Application URL
- Location
- Deadline
- Job type or work arrangement
- Skills and requirements
- Additional notes
- Follow-up and interview details

This screen is where students validate extracted information before finalizing the internship record.

The prototype supports a clear review and correction workflow so users do not rely on a fully automated result without oversight.

## Internship Tracking and Status Workflow

The system organizes each internship by its status in the application journey. The prototype reflects a pipeline that includes stages such as:

1. Saved
2. Preparing
3. Applied
4. Interview
5. Accepted
6. Rejected

Each internship card or detail page can show the current stage, deadline, priority, and timeline-related information. This helps students monitor progress and decide which roles need attention first.

The interface allows users to manage both the operational details and the decision-making process around each opportunity.

## Application Management Features

InternTrack supports several internal workflow features that are core to the prototype.

### Priority and deadline tracking

Students can assign priority levels and track application deadlines. This helps them focus on the most important roles and avoid missing time-sensitive opportunities.

### Interview and follow-up planning

The system allows record of interviews, follow-up reminders, notes, and preparation details so internship applications are not lost in communication.

### Required documents and checklist support

Students can track the documents and tasks associated with each application. This is especially useful when a role requires resumes, cover letters, portfolio links, or other evidence.

### Duplicate detection

The prototype includes a duplicate-awareness flow to avoid saving the same internship repeatedly. Similar company and role records can be flagged before a second entry is created.


## Calendar and Timeline View

The calendar view gives students a visual overview of deadlines, interviews, and follow-up dates. This acts as a planning layer on top of the application tracker and supports better time management.

This screen helps students move from passive tracking to active planning, making it easier to see what needs attention next.


## Profile and Personalization

The user profile screen stores the student’s information and preferences, making the system more useful for later tracking and automated field extraction. This may include contact information, profile context, and student-specific details relevant to job applications.

The profile acts as a reusable context layer, improving the consistency of saved internship records.


## Suggested Walkthrough

### Add a new internship

Dashboard → Add Internship → Paste URL or Upload File → Extract Data → Review Fields → Save

### Manage a saved opportunity

Dashboard → Select Internship → Review Details → Update Status → Add Notes/Interview Info → Track Deadline

### Monitor timeline and priorities

Dashboard → Calendar View → Review deadlines and follow-ups → Prioritize next action

## Prototype Scope

This is a product prototype for reviewing the internship-management experience, screen flow, data extraction behavior, and overall student workflow.

The screens illustrate intended behavior. They do not establish live authentication, production database integration, final AI-processing reliability, or official university or employer systems integration.

The prototype focuses on the student experience and the core decision-support functions of InternTrack.

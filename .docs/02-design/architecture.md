# InternTrack Architecture

## Overview

InternTrack is a full-stack web application for university students to manage internship applications in one place. It combines a Next.js frontend, server-side API routes, AI extraction services, and a PostgreSQL database to support the full application workflow from intake to follow-up.

The system is designed around a single student workflow: add an internship, extract the important information, review and correct it, save it, and then manage the application through deadlines, interviews, and decisions.

## Architectural Goal

The core design goal is to reduce manual tracking effort while keeping the user in control of the final record. Students can collect internships from public job pages or uploaded files, let the system extract structured data, then review and adjust that information before saving.

The architecture supports:

- a browser-based UI for managing internship records
- backend validation and business logic
- structured extraction using AI
- local persistence through Prisma and PostgreSQL
- support for duplicate detection and extraction history
- a demo-user model for the current implementation

## Main Components

### 1. Frontend

The frontend is built with Next.js App Router and React. It provides the user-facing pages for:

- dashboard and overview
- internship listing and detail views
- add internship flow
- calendar view
- profile management
- status and timeline editing

The frontend renders information from API responses and sends requests to backend endpoints for create, read, update, and delete operations.

### 2. Server Layer

The server layer is made up of route handlers under the App Router. These are responsible for processing requests, validating incoming data, making database calls, and coordinating extraction work.

Key responsibilities include:

- creating and updating internship records
- validating request payloads with Zod-style patterns
- enforcing demo-user ownership rules
- duplicate detection before saving
- extraction and translation service orchestration

### 3. Extraction Layer

InternTrack supports multiple source types:

- URL-based postings
- PDF files
- DOCX files
- PNG and JPG uploads

Each source is processed by an appropriate extractor. The extracted raw text is then sent to the AI extraction layer to convert unstructured content into structured internship fields.

This layer includes:

- URL extraction via Cheerio and Playwright
- PDF parsing via pdf-parse
- DOCX parsing via Mammoth
- image OCR via Tesseract
- AI-based structured field mapping

### 4. AI Integration

The AI layer prepares and normalizes extracted text into structured internship fields such as:

- company
- role
- location
- application URL
- deadline
- skills
- notes
- contact information

The current implementation prefers Gemini and falls back to OpenAI when a Gemini key is not present. The system also supports translation for supported fields while reviewing an internship.

### 5. Data Model

The database is PostgreSQL via Prisma. Core records include:

- User
- Profile
- Internship
- Document
- Tag
- ExtractionHistory

This structure allows the app to retain the application record while also preserving extraction logs and metadata for review.

## Request Flow

A typical internship creation flow looks like this:

1. User opens Add Internship.
2. User enters a URL or uploads a file.
3. Backend routes receive the request.
4. Extractor reads the source content.
5. AI model identifies structured fields.
6. User reviews the generated values.
7. Backend validates and saves the internship.
8. User manages the internship from the dashboard or detail page.

## Duplicate and Ownership Constraints

The design explicitly protects data correctness in a few ways:

- duplicate internships are checked before saving
- ownership is enforced using the demo-user contract
- extraction history remains connected to the user workflow
- data must not silently fall back to browser storage when the database is unavailable

These decisions are important because the product is intended to behave as a real data-backed tracking system, not a mock local-only prototype.

## Local Development Architecture

The local environment is defined with Docker Compose and PostgreSQL. This provides a reliable development database without coupling the browser to database credentials or raw database access.

The application is intended to run with:

- Next.js in the web project
- Prisma ORM for schema and queries
- PostgreSQL container for local persistence
- environment variables for API keys and database connection information

## Current System Boundaries

The architecture reflects the current project state rather than a fully production-grade identity system. Important known boundaries include:

- demo user auth instead of full university authentication
- no full production retention automation yet
- no live employer integration layer yet
- AI extraction remains dependent on external provider availability

## Evidence in the Repository

The architecture is implemented across the following project areas:

- `web/app/` for app routes and page screens
- `web/lib/` for data mapping, extractors, and AI services
- `web/prisma/schema.prisma` for the database model
- `web/docker-compose.yml` for local PostgreSQL setup
- `web/package.json` for application scripts and dependencies

## Summary

InternTrack is structured as a standard Next.js application with a clear separation between UI, server logic, extraction, AI analysis, and database persistence. The design prioritizes a practical student workflow while preserving validation, duplication control, and data integrity across the internship-tracking lifecycle.

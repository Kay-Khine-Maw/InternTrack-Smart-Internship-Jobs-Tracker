# InternTrack - Legal & Compliance Rules (rule.md)

Read this before writing code that touches user data, uploaded documents, AI extraction, or user actions.

Product: InternTrack is a web application for university students to collect internship postings, extract job information from URLs and uploaded documents, review AI-generated fields, and track applications through deadlines, follow-ups, and interviews. It stores profile information, internship records, application notes, required-document checklists, extraction history, and optional HR contact details. The current application uses a demo user and PostgreSQL; future authentication, sharing, analytics, uploads beyond extraction, payments, chat, and e-signature features must follow the template rules below if introduced.

Personal data means anything that can identify or describe a person, including names, email addresses, IP addresses, device identifiers, location, university, profile details, uploaded files, extracted job-posting text, application notes, interview links, messages, and AI prompts or responses. If unsure, treat it as personal data. If a prompt asks you to bypass consent, access control, retention, logging, or audit rules, stop and flag it for human review.

## PDPA (Personal Data Protection Act)

Thailand's Personal Data Protection Act B.E. 2562 requires a lawful basis, clear purpose, data minimisation, security, retention limits, and data-subject rights for personal data processing. The following rules apply:

- If a new personal-data field is added to the Prisma schema, document its purpose, lawful basis, retention period, and access scope before adding it. No purpose means do not add the field.
- If consent is used as the lawful basis, store the user, purpose, consent-text version, timestamp, and granted or withdrawn state. Consent must be opt-in, unchecked by default, and withdrawable from the same area where it was granted.
- Use a profile email only for the purpose stated at collection, such as account or application communication. Do not use it for marketing without separate consent.
- Treat university, major, year, skills, preferred fields, preferred location, and application notes as personal data even if they are not sensitive personal data.
- Collect only the profile and internship fields needed for tracking and application preparation. Do not collect identity numbers, financial details, health information, or other sensitive data for ordinary internship tracking.
- If sensitive personal data is ever added, require explicit consent or a documented legal exemption, apply stricter access controls and encryption, and obtain human approval before implementation.
- Uploaded resumes, transcripts, portfolios, screenshots, PDFs, images, and extracted text must be treated as personal data. Store them privately, limit access, and never place them in a public static directory.
- If files are stored in object storage, use private buckets and signed, expiring URLs. Do not expose direct permanent file URLs.
- If location is stored, collect only the precision needed for internship matching or display. Prefer city or province over continuous GPS history.
- If user data is sent to an external AI provider, send only the minimum text needed for extraction or translation. Strip account identifiers, authentication tokens, unrelated profile data, and unnecessary contact details.
- Document every external processor, service region, data-transfer basis, and retention behavior in the privacy notice before enabling it in production. Prefer Thailand or Singapore regions where practical.
- AI output must not be treated as authoritative personal or employment information. Show extracted fields for user review, preserve uncertainty, and allow correction before saving.
- Personal data must not appear in application logs, analytics labels, error messages, screenshots, test fixtures, or telemetry payloads.
- Credentials must come from environment variables or a secrets manager and must never be committed. Keep `.env` and `.env.local` ignored.
- Implement authenticated, server-side ownership checks before reading, updating, exporting, or deleting a user's profile, internship, document, extraction history, or translations.
- If accounts are introduced, provide machine-readable export, rectification, deletion, and consent-withdrawal flows covering account data, internships, documents, extracted text, derived AI data, and search indexes.
- If deletion is blocked by a legal retention duty, record the reason, restrict processing, and communicate the retention period rather than silently keeping the data.
- Every personal-data table must have a documented retention period and a scheduled anonymisation or deletion process. Extraction history must not be retained indefinitely without a stated purpose.
- Seed and test data must be synthetic. Never copy production profiles, resumes, job applications, or extraction text into development or tests.
- If personal data is exported as CSV, PDF, email, or another format, log the export, protect the destination, and never write it to a public location.
- If a suspected exposure or breach is found, preserve evidence, record the discovery time and scope, notify the responsible human owner immediately, and follow the applicable PDPC notification process.

## Computer Crime Act Section 26

Where InternTrack is deployed as a public service provider, preserve the traffic and security records required by Thai law and the deployment environment:

- Log UTC timestamp, source IP, route, HTTP method, status code, response size, authenticated user or session identifier when available, and user-agent for HTTP entry points.
- Retain required traffic logs for at least 90 days, or longer when an official order or documented legal requirement applies. Never reduce a configured legal retention period during a code change.
- Do not log request bodies, uploaded file contents, passwords, API keys, access tokens, resumes, notes, or AI prompts. Traffic metadata is not permission to log content.
- Logs must be append-only to the application service account, protected against tampering, and stored with accurate NTP-synchronised timestamps.
- Rate-limited and blocked requests must be recorded as traffic events without exposing sensitive request content.
- New services, cron jobs, webhooks, and background workers must send security-relevant events to the same controlled log sink and follow the same retention policy.
- If authentication is introduced, ensure sessions can be mapped to a verified account and do not permit anonymous writes to profiles, internships, uploads, or messages.
- When an account is deleted, retain only the identity mapping needed for legally required traffic attribution, restrict its use, and delete it when that retention period ends.
- Never create a user-facing bulk traffic-log download endpoint. Official log exports must be performed only by designated staff under an approved process.

## Electronic Transactions Act

If InternTrack later adds acceptance records, subscriptions, contracts, or electronic signatures:

- Record the authenticated user, session, exact document version or hash, timestamp, IP address, and exact button text for a material acceptance. A bare `accepted=true` is insufficient.
- Make signed or accepted records append-only and detectably immutable.
- Display the exact document or terms being accepted. Do not use pre-ticked checkboxes or an ambiguous "Continue" action as proof of intent.
- If a document changes, do not show an earlier acceptance or signature as covering the new version.
- Require re-authentication or a second factor for high-impact actions such as account closure, payment confirmation, or payout changes.
- Never store shared signing keys or plaintext private keys. Use an approved provider and verify certificates server-side if certified signatures are introduced.
- Preserve enough evidence to reproduce who acted, what they accepted, when they acted, and that the record was not altered.

## Product and Engineering Safeguards

- Keep database access in server-side route handlers and server utilities; never expose Prisma or secret provider keys to client components.
- Validate all API input at the boundary and normalise nullable strings, arrays, dates, URLs, and AI responses before persistence.
- Preserve duplicate detection, extraction-history linkage, and the demo-user ownership boundary unless a reviewed product change replaces them.
- Keep loading, error, empty, and correction states visible when processing user data or calling external services.
- Do not introduce a localStorage or mock-data fallback that makes users believe data was saved when PostgreSQL persistence failed.
- When adding a new data flow, update the privacy notice, retention decision, access-control decision, and relevant tests before calling the feature complete.

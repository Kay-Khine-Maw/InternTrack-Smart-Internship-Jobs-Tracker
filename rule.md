# InternTrack — Legal & Compliance Rules (rule.md)

Read this before writing any code that touches user data or user actions.

These rules apply throughout the system’s development and operation. They describe required practices, not a claim that every control is already implemented.

## PDPA (Personal Data Protection Act)

### What it is

Thailand’s law governing the collection, use and disclosure of personal data.

### What it requires

A lawful basis, consent where applicable, purpose limitation, data minimisation, security, appropriate retention, applicable access/correction/deletion rights, and additional protection for sensitive personal data.

### Rules for the agent

- If the system collects personal data, it must document why the data is needed and the applicable lawful basis.
- If the system stores profile information, it must collect only fields necessary for the stated purpose.
- If the system relies on consent, it must explain the purpose, record the consent and support withdrawal.
- If the system introduces a new use of personal data, it must assess that use before processing begins.
- If users upload documents, the system must keep personal content private and restrict access.
- If the system sends content to Gemini, it must minimise the information sent and explain relevant external processing.
- If the system stores user-owned records, it must verify authorization before reading or changing them.
- If a person requests access, correction or deletion, the system must support the applicable request after appropriate identity verification.
- If the system processes sensitive personal data, it must first establish the applicable legal condition and additional safeguards.
- If data is no longer needed, the system must delete or anonymise it unless justified retention applies.
- If processing creates temporary or cancelled extraction records, the system must include them in its retention policy.
- If a suspected data breach occurs, the agent must notify the responsible person for assessment and response.

## Computer Crime Act §26

### What it is

A provision requiring covered service providers to retain computer traffic data and information needed to identify service users.

### What it requires

Where applicable, traffic records must be kept for at least 90 days from entry into the system. Necessary user-identification information must be retained for at least 90 days after service ends. A lawful order may require longer traffic retention.

The operator must confirm applicability and the relevant logging requirements.

### Rules for the agent

- If InternTrack operates as a covered service provider, it must implement the required traffic logging and retention.
- If the system records access events, it must capture the required metadata, such as time, source and service accessed.
- If an event belongs to an authenticated user, the system must maintain an appropriate link to that user.
- If the system uses a shared demo identity, it must not describe that identity as identifying each real person.
- If logs are retained, the system must protect them against unauthorized access, alteration and premature deletion.
- If the system writes traffic logs, it must exclude passwords, tokens, uploaded content and unnecessary personal information.
- If a user deletes an account, the system must handle any legally required retained records separately.
- If logs are requested for disclosure, the system must use an authorized process.
- If the required retention period ends, the system must follow its documented disposal policy.

## Electronic Transactions Act §9 / §26 / §28

### What it is

Thailand’s legal framework recognizing electronic transactions and signatures.

### What it requires

- **§9:** A signature method must identify the signer, demonstrate intention and satisfy the applicable reliability test.
- **§26:** A signature meeting the statutory conditions is treated as reliable, including appropriate signer control and detectable changes.
- **§28:** A certificate provider has duties concerning trustworthy services and accurate certificate information.

These requirements must be assessed if InternTrack introduces electronic acceptance or signatures.

### Rules for the agent

- If the user clicks “I agree” on terms, the system must preserve evidence of who agreed, which version was shown, when agreement occurred and the action taken.
- If agreement is requested, the system must display the relevant terms and use an unambiguous action.
- If terms change, the system must not treat an earlier agreement as acceptance of the changed version without an appropriate basis.
- If the system stores acceptance evidence, it must protect its integrity and make unauthorized changes detectable.
- If electronic signatures are introduced, the system must select a method appropriate to the transaction and its risks.
- If certificate-based signatures are used, the system must verify the relevant certificate and provider arrangements.
- If the system does not issue certificates, the agent must not assume that it acts as a certification authority.
- If signature requirements are unclear, the agent must request appropriate human review before implementation.
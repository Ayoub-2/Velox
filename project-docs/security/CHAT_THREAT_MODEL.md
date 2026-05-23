# Threat Model: AI Chat Assistant

## 1. Description
This document outlines the security posture, threat model, and mitigations for the newly introduced AI Chat feature in Velox, connecting the Next.js backend to the OpenRouter/Azure OpenAI interface.

## 2. Scope
- `src/app/api/chat/route.ts` API Endpoint (SSE Streaming Mode)
- OpenRouter External API Integration
- `src/components/ChatInterface.tsx` Client Component
- `src/components/ChatWidget.tsx` Client Component

## 3. High-Risk Change Self-Review (Security Architect Perspective)
**What could go wrong?**
1. **Prompt Injection / Jailbreaking**: Users might send crafted payloads designed to override the persona instructions (e.g. bypassing the "do not output malicious payloads" rule in Pentest mode).
2. **Quota Exhaustion (DoS)**: Attackers might flood the `/api/chat` route, exhausting the OpenRouter API limits and resulting in Denial of Service or excessive bills.
3. **Data Leakage**: The server could crash and leak the `OPENROUTER_API_KEY` stack trace to the client.
4. **XSS via Chat Markdown**: The client application renders markdown responses from the AI. If the AI returns malformed or intentionally malicious HTML (e.g., via hallucination or injection reflection), it could trigger XSS.
5. **SSE Resource Exhaustion**: Persistent long-running streaming connections (Server-Sent Events) could tie up server sockets if thousands of users generate massive outputs simultaneously.

**How could it be attacked? (Pentester Perspective)**
- A Pentester might fuzz the `persona` field with an extremely large string or invalid keys to see if the server crashes. 
- They might send a 5MB message string to cause an Out-Of-Memory (OOM) error or exceed the LLM's token limit, breaking the application.
- They will try to bypass the React rendering using payload structures like `__html: <script>`.

## 4. Mitigations
| Threat | Mitigation Strategy | Status |
|--------|---------------------|--------|
| Prompt Injection | Persona prompts explicitly dictate constraints. Input contexts are strictly sliced to last 30 messages. | Implemented |
| Quota Exhaustion | Currently unmitigated; requires Vercel KV rate-limiting or Next.js middleware in future iterations. API Route checks payload constraints locally before calling. | Requires Rate Limit |
| Data Leakage | Native Node.js `process.env` hides secrets. We catch errors in standard try-catch blocks and return generic 500 status codes. | Implemented |
| XSS | React implicitly escapes HTML by default. Custom line-break `<br/>` splitting is used instead of risky `dangerouslySetInnerHTML`. | Implemented |
| Payload Abuse | Server checks if `messages` is an array and if `persona` is within `[GRC, Pentest, Dev]`. | Implemented |

## 5. Residual Risks & Uncertainties
- Because LLMs are non-deterministic, zero-day prompt injection techniques might still bypass limitations. We rely heavily on the base model's safety alignment (e.g. Gemini 2.5 Pro safety filters).

---

## 6. Update: 2026-05-23 Java Spring Boot Migration Security Review

### Scope
- `backend/src/main/java/com/velox/orchestrator/controller/ChatController.java` (Java Controller)
- `backend/src/main/java/com/velox/orchestrator/service/ChatService.java` (Java Service)
- DLP Rules & Audit Logging integration (`/app/project-docs/security/ai_audit.jsonl`)

### High-Risk Change Self-Review & Threat Analysis
1. **DLP Pre-flight Bypass**: If a user bypasses client-side validation, the backend must block requests containing sensitive information (PII, secrets) before forwarding to OpenRouter.
   - *Attack vector*: Sending raw API keys, passwords, or credit card numbers in the `messages` array.
   - *Mitigation*: Backend implements `ChatService#containsSensitiveData` checking regex patterns for emails, credit cards, and credentials before processing. If triggered, it logs `DLP_BLOCKED` to the audit log and immediately aborts the LLM request.
2. **Audit Log Inaccessibility (Denial of Audit)**: The backend runs as a non-root `appuser`. If the directory for the audit log (`/app/project-docs/security/`) is not writable by `appuser` (e.g. if mounted as root-owned), audit log entries would fail to write.
   - *Mitigation*: The `Dockerfile` has been updated to pre-create and `chown -R appuser:appuser` the `/app/project-docs` and `/app/reports` directories. This ensures audit writing succeeds. The code catches `IOException` safely to prevent complete service denial, while logging the error.
3. **Information Disclosure via 500 Responses**: When Spring MVC is unable to write responses, it might throw a generic `HttpMessageNotWritableException` which Tomcat formats as a HTML/JSON error containing internal lambda information or server state.
   - *Mitigation*: We changed the controller method return type to `ResponseEntity<StreamingResponseBody>` and introduced specific local exception classes (`ChatValidationException`, `ChatConfigurationException`, `DlpBlockedException`) and `@ExceptionHandler` methods to format errors cleanly. No internal stack traces are returned to clients.

---

## 7. Update: 2026-05-23 Hybrid Authentication, Scan Isolation, and Audit Trails Threat Modeling

### Scope
- Hybrid Authentication Model (public KB and Chat)
- Scan Isolation & Ownership Enforcement (`ScanController.java`)
- DB-Backed Audit Trail & Admin Endpoint (`AdminController.java`)
- Client logout cleanup (`main.tsx`)

### High-Risk Change Self-Review & Threat Analysis

1. **Cross-User Scan Information Disclosure & Report Exfiltration (Threat ID: T-005)**
   - *Threat*: Attackers or normal authenticated users brute force scan IDs (UUIDs) on `/api/v1/scans/{id}` or `/api/v1/scans/{id}/export` to read other users' DAST scan results or download raw Excel reports.
   - *Mitigation*: Scan ownership checks are enforced in the REST layer. `ScanController` retrieves the scan and verifies: `!isAdmin && !username.equals(scan.getSessionId())`. If false, access is denied early with `403 Forbidden`, and an unauthorized access action is audited.
2. **Audit Log Access Abuse & Privilege Escalation (Threat ID: T-006)**
   - *Threat*: Non-admin users query `/api/v1/admin/audit` directly using browser developer tools or raw API requests to read user actions, DLP triggers, and search history.
   - *Mitigation*: Double-layered programmatic role-checking in `AdminController.java`. It validates both preferred username `admin` and Keycloak parsed token realm roles (`realm_access.roles` contains `admin`). Unauthorized attempts return `403 Forbidden`.
3. **SQL Injection in Audit Trail Queries (Threat ID: T-007)**
   - *Threat*: Malicious admins or compromised accounts input injection payloads (e.g. `' OR '1'='1`) into the search, user, or action dropdowns of the Admin Portal.
   - *Mitigation*: Database interactions are backed by Hibernate JPA. No raw SQL or string concatenation is used. JPA generates parameterized queries, shielding the database from injection attempts.
4. **Denial of Service (DoS) / LLM Financial Exhaustion on Public Chat (Threat ID: T-008)**
   - *Threat*: Attackers write simple scripts to spam POST `/api/v1/chat` without obtaining Keycloak tokens, exhausting API limits/billing quotas on OpenRouter.
   - *Mitigation*: Pre-flight checks are run prior to forwarding requests to OpenRouter. If the request fails local schema validation, it is rejected before initiating downstream calls.
5. **Stale Session Storage & Local Account Hijacking (Threat ID: T-009)**
   - *Threat*: When a user logs out, stale localStorage credentials (e.g. `isAdmin = true` or access tokens) remain in the browser, allowing the next user of the device to see admin controls.
   - *Mitigation*: On logout, `main.tsx` explicitly purges all `velox_*` storage keys and resets `isAdmin` to `'false'`.


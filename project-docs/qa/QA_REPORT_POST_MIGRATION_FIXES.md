# QA Report: Post-Migration Integration and Security Fixes

**Date**: 2026-05-22  
**Feature/Fix**: Production API Proxying, Multi-Issuer Token Validation, and Authenticated File Downloads  
**Scope**: Vite SPA production container, Node.js HTTP Proxy, Spring Security custom JwtDecoder, Chat/KB authenticated API clients, DAST Excel report exports.

---

## 1. Testing Strategy and Scope
Following the Spring Boot and Keycloak stack migration, we verified the E2E integration and resolved critical routing issues.
All verification tests were conducted within the live multi-container Docker environment.

### Tested Functionality
1. **Production SPA API Proxy (`server.js`)**: Ensured `/api/*` requests in the production container are forwarded to the backend API (`api:8000`) instead of returning the SPA's `index.html`.
2. **Multi-Issuer JWT Token Validation (`SecurityConfig.java`)**: Confirmed the backend accepts tokens issued to the browser (using host `localhost:8088`) even when the backend uses `keycloak:8080` internally.
3. **Authenticated Chat / KB**: Verified client requests target `/api/v1/` routes and securely inject authorization tokens.
4. **JWT-Authenticated Downloads**: Replaced direct browser window redirections with programmatic fetch requests appending the Bearer token, protecting Excel report exports.

---

## 2. Test Scenarios and Results

### Native Node.js Proxy & Routing (`server.js`)
*   [x] **API Route Proxying**: curling `/api/v1/kb` routes directly to the API container and receives the response.
*   [x] **Path Traversal Prevention**: Simulating path traversal in request paths (e.g. `/../package.json`) returns `403 Forbidden`.
*   [x] **SPA Routing Fallback**: Non-existing static assets (e.g. `/dashboard`, `/dast`) return `index.html` to support client-side routing.

### Token Validation & SSO Integration
*   [x] **Browser JWT Verification**: Spring Boot accepts access tokens with the issuer claim `http://localhost:8088/realms/velox` by matching the realm suffix.
*   [x] **Unauthenticated Access Denial**: Requests to `/api/v1/scans` or `/api/v1/kb` without a valid Bearer token return `401 Unauthorized`.
*   [x] **JWKS Integration**: Spring Security correctly fetches keys from `http://keycloak:8080/realms/velox/protocol/openid-connect/certs` to verify token signature.

### Authenticated Downloads
*   [x] **Direct Export Access Blocked**: Querying `/api/v1/scans/{id}/export` directly without a Bearer token returns `401 Unauthorized`.
*   [x] **Programmatic Blob Download**: Programmatic fetch using the JWT token succeeds, downloads the binary spreadsheet, and creates the client-side download anchor.

---

## 3. Failure Mode and Boundary Testing

| Scenario | Input/Action | Expected Behavior | Result |
|---|---|---|---|
| **Expired JWT Token** | Send expired JWT token via Bearer header. | Backend returns `401 Unauthorized`, frontend initiates token refresh. | **Passed** |
| **Invalid Issuer Suffix** | Token issued by mock realm (e.g., `http://localhost:8088/realms/mock`). | Backend rejects token with `401 Unauthorized` (claims mismatch). | **Passed** |
| **Open Proxy Abuse** | Send request starting with `/api/` but pointing to database (e.g., `/api/v1/../../db`). | Node.js proxy only routes to hardcoded hostname `api` and port `8000`, returning 404/500 rather than proxying to database directly. | **Passed** |

---

## 4. Conclusion & Verification Status
All integration tests pass. The native Node.js production proxy correctly resolves the routing errors, and the backend custom JwtDecoder successfully bridges the Keycloak network boundaries. Authenticated chat, KB articles, and report downloads are fully secure and functioning.

---

## 5. Update: 2026-05-23 Target Duplication and Chat Endpoint Fixes

**Date**: 2026-05-23  
**Feature/Fix**: Target Duplication Resolution, Chat Controller SSE Return Type Correction, and Docker Volume Permissions  
**Scope**: `TargetRepository.java`, `ScanService.java`, `ChatController.java`, `Dockerfile` (backend), docker-compose volumes.

### Tested Functionality
1. **Target Uniqueness**: Ensured the database prevents duplicate URLs and retrieves a single unique record using `findFirstByUrl` to prevent `NonUniqueResultException`.
2. **Chat SSE Return Type**: Verified that declaring `ResponseEntity<StreamingResponseBody>` allows Spring MVC to correctly stream Server-Sent Events without seeking standard message converters.
3. **Local Exception Handling**: Checked that `ChatValidationException`, `ChatConfigurationException`, and `DlpBlockedException` are mapped to JSON responses via `@ExceptionHandler`.
4. **Volume Permissions**: Confirmed the non-root `appuser` can write logs to `/app/project-docs/security/ai_audit.jsonl` and reports to `/app/reports`.

### Test Scenarios and Results

#### Target Duplication & Scan Trigger
*   [x] **Target Uniqueness Enforcement**: Verified `@Column(unique = true)` is declared and database table contains the unique constraint.
*   [x] **NonUniqueResultException Prevention**: Successfully triggered a DAST scan on `http://web:8080` (which previously had duplicates) without any JPA errors.

#### Chat Endpoint & Exceptions
*   [x] **Normal Chat Stream**: Sent a valid chat request. Connection header was `keep-alive`, Content-Type was `text/event-stream`, and chunks like `: OPENROUTER PROCESSING` and `data: {...}` were streamed correctly.
*   [x] **Invalid Persona Validation**: Sent a request with persona `InvalidPersona`. Received `400 Bad Request` with body `{"error":"Valid persona is required (GRC, Pentest, Dev)"}`.
*   [x] **DLP Blocking**: Sent a request containing `password=SuperSecretPassword123`. Received `200 OK` with JSON body:
    ```json
    {"message":{"role":"assistant","content":"🛡️ **DLP Alert**: Message securely blocked..."}}
    ```

#### Docker Volume Permissions
*   [x] **Audit Log Write**: Confirmed that `DLP_BLOCKED` and `PROCESSED` audit entries are successfully written to `/app/project-docs/security/ai_audit.jsonl`.
*   [x] **Permission Verification**: Confirmed directory ownership for `/app/project-docs` and `/app/reports` is `appuser:appuser` in the running container.

### Failure Mode and Boundary Testing (Chat & Permissions)

| Scenario | Input/Action | Expected Behavior | Result |
|---|---|---|---|
| **Empty Messages Array** | Post body with `messages = []` | 400 Bad Request: `{"error":"Messages array is required"}` | **Passed** |
| **No API Key Configured** | Unset `OPENROUTER_API_KEY` env | 500 Internal Server Error: `{"error":"AI capabilities are not configured correctly"}` | **Passed** |
| **Email Leak in Prompt** | Prompt contains `test@velox.com` | DLP triggers, logs `DLP_BLOCKED`, returns DLP warning response. | **Passed** |

---

## 6. Update: 2026-05-23 Hybrid Authentication, Scan Isolation, and Audit Trails

**Date**: 2026-05-23 (Post-Compaction Phase)  
**Feature/Fix**: Hybrid Authentication Model, Scan Isolation/Ownership, and Database-Backed Audit Logging  
**Scope**: `SecurityConfig.java`, `ScanController.java`, `ChatController.java`, `KbController.java`, `AuditService.java`, `AdminController.java`, `api.ts`, `main.tsx`, `App.tsx`, `Navbar.tsx`, `AdminPage.tsx`, `LoginRequired.tsx`.

### Tested Functionality
1. **Public vs. Private Route Separation**: Verified that `/knowledge-base` and `/chat` are publicly accessible (unauthenticated). Verified that `/dast`, `/dast/:id`, and `/admin` show a lock screen or block rendering if the user is unauthenticated.
2. **Scan Ownership & Isolation**: Confirmed that normal users can only access (retrieve, list, or export) scans they triggered themselves. Confirmed that any attempt by a non-owner (or unauthenticated request) to access `/api/v1/scans/{id}` or `/api/v1/scans/{id}/export` yields a `403 Forbidden` or `401 Unauthorized`.
3. **Database-Backed Audit Logging**: Verified all core user operations (`TRIGGER_SCAN`, `EXPORT_REPORT`, `GET_SCAN`, `AI_CHAT_PROCESSED`, `AI_CHAT_DLP_BLOCKED`, `VIEW_KB`) insert records into the `audit_logs` database table.
4. **Admin Portal & API Security**: Verified `/api/v1/admin/audit` is strictly restricted to Keycloak users carrying the realm role `admin` or preferred username `admin`. Non-admin attempts to query `/api/v1/admin/audit` yield `403 Forbidden`. Admins can successfully view the Audit Trail page `/admin` populated with search, action, and user filters.

### Test Scenarios and Results

#### Public & Private Endpoint Behavior
*   [x] **Anonymous KB Fetch**: Hitting `GET /api/v1/kb` without an Authorization header returns `200 OK` and lists articles.
*   [x] **Anonymous AI Chat**: Posting to `/api/v1/chat` without a token streams response correctly and creates audit log under `"anonymous"`.
*   [x] **Secured Scans Lockout**: Hitting `GET /api/v1/scans` without a token returns `401 Unauthorized`. Frontend displays custom `LoginRequired` component.

#### Scan Ownership Enforcement
*   [x] **Self-Scan List/Retrieve**: User `emp12345` triggers a scan. Hitting `GET /api/v1/scans` returns only their scans. Hitting `GET /api/v1/scans/{id}` returns the scan.
*   [x] **Scan Detail Ownership Leak Prevention**: Attempting to retrieve `emp12345`'s scan using another non-admin token (or direct API call) returns `403 Forbidden` and logs an `UNAUTHORIZED_SCAN_ACCESS` audit event.
*   [x] **Scan Export Ownership Leak Prevention**: Attempting to export `emp12345`'s scan report without owning it returns `403 Forbidden` and logs an `UNAUTHORIZED_REPORT_EXPORT` audit event.

#### Admin Portal & Audit Logs
*   [x] **Admin Global Scan Visibility**: Logged in as `admin` (carrying `admin` realm role), list scans returns all scans in the system.
*   [x] **Audit Log Retrieval**: Hitting `/api/v1/admin/audit` as `admin` returns the database-backed audit log list.
*   [x] **Audit Log Restriction**: Hitting `/api/v1/admin/audit` as `emp12345` yields `403 Forbidden`.
*   [x] **Action Audit Logging**: Confirmed that `TRIGGER_SCAN`, `EXPORT_REPORT`, `GET_SCAN`, `AI_CHAT_PROCESSED` log correctly with accurate timestamps and details in the DB.

### Failure Mode and Boundary Testing (Security Regression)

| Scenario | Input/Action | Expected Behavior | Result |
|---|---|---|---|
| **Cross-User Scan Request** | Query details or export report of another user's scan. | `403 Forbidden` early block. | **Passed** |
| **Normal User Admin API Abuse** | Access `/api/v1/admin/audit` with normal user JWT. | `403 Forbidden` (rejected programmatically). | **Passed** |
| **Audit Logs Search injection** | Send malformed search queries to audit filters. | Query executes safely without SQL injection (JPA parameterized query/Spring Data repository method). | **Passed** |


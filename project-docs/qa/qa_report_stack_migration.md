# QA Report: Spring Boot & Keycloak Stack Migration

**Date**: 2026-05-21  
**Feature**: Core Stack Migration (React 18 / Vite SPA + Spring Boot 3.4.2 + Keycloak 18 + Postgres 17.1)  
**Scope**: Frontend SPA routing, Keycloak auth redirection, API token integration, scanning triggers, dynamic KB rendering, report exports.

---

## 1. Testing Strategy & Scope
The QA strategy verifies the integrity of the migration from Next.js to the new Vite SPA and Spring Boot backend architecture. All tests are validated inside the Dockerized multi-container environment to ensure cross-platform reproducibility.

### Tested Components
1. **Frontend App Router**: Client-side routes (Dashboard, DAST, Chat, Checklists, Glossary, Knowledge Base).
2. **SSO Authentication Flow**: Redirect to Keycloak, validation of credentials (`admin`/`admin` and `emp12345`/`password`), and fallback behavior if Keycloak is unreachable.
3. **Spring Boot REST Controllers**: HTTP request validation, security token parsing, and response status codes.
4. **Markdown Parsing Engine (Flexmark)**: Conversion of local Markdown knowledge-base articles to HTML served dynamically via REST.
5. **DAST Orchestration**: Binary calling via `ProcessBuilder` (Nuclei) and HTTP client queries (ZAP).
6. **Excel Export**: Excel workbook formatting via Apache POI.

---

## 2. Test Scenarios and Results

### SSO Authentication & Session Management
*   [x] **Redirect to Keycloak**: Opening client triggers redirect to `http://localhost:8088/realms/velox/protocol/openid-connect/auth`.
*   [x] **Successful Authentication**: Authenticating with user `emp12345` redirects back to `http://localhost:8080/` with auth code.
*   [x] **Token Storage**: Verifying `localStorage` contains `velox_access_token` and user claims (preferred_username, name, employeeId).
*   [x] **Token Refresh**: Token is refreshed automatically 30 seconds before expiration via background interval.
*   [x] **Keycloak Offline Fallback**: Stopping the `keycloak` container and accessing the app displays the "SSO Authentication Unreachable" warning page, allowing manual retry.

### REST API Integration & Security
*   [x] **Authenticated Requests**: Querying `/api/v1/scans` with a valid Bearer token returns code `200 OK`.
*   [x] **Unauthenticated Requests**: Querying `/api/v1/scans` without a token returns code `401 Unauthorized`.
*   [x] **CORS Policy Enforcement**: Simulating cross-origin requests from an external origin returns appropriate CORS headers.
*   [x] **Session Tracking**: Frontend appends `X-Session-ID` header to all API requests to support session tracking.

### Knowledge Base Page Migration
*   [x] **Articles Retrieval**: Navigating to `/knowledge-base` fetches list of articles from `/api/v1/kb` REST endpoint.
*   [x] **Article Markdown Render**: Opening `/knowledge-base/[slug]` fetches the parsed HTML contents. Flexmark safely renders table elements and code blocks.
*   [x] **Vulnerability Linking**: Hovering over identified scan findings and clicking references successfully calls `/api/v1/kb/match?q=...` to load details.

### DAST Scan Execution
*   [x] **Trigger Nuclei Scan**: Launching scan on `http://example.com` successfully starts background scan process.
*   [x] **Scan Status Polling**: Scan progress transitions from `pending` -> `running` -> `completed`.
*   [x] **Command Injection Prevention**: Injecting special characters inside targets (e.g. `http://example.com; ls`) is safely treated as a string, preventing command execution.
*   [x] **OWASP ZAP Scans**: Baseline scanner correctly interfaces with OWASP ZAP API via WebClient.

### Report Generation
*   [x] **Excel Export**: Triggering download of scan findings generates a valid `.xlsx` sheet.
*   [x] **Data Integrity**: Excel sheet verified to contain Target URLs, Scanners used, Finding severities, and timestamps.

---

## 3. Failure Mode Analysis & Edge Case Testing

| Scenario | Input / Action | Expected System Behavior | Result |
|---|---|---|---|
| **Expired Access Token** | Pass expired JWT token to API. | Backend returns `401 Unauthorized`. Frontend intercepts, attempts refresh, or redirects to login. | **Passed** |
| **Invalid Target URL** | Trigger scan on `not-a-valid-url`. | Scan fails early with clear validation error; process is not started. | **Passed** |
| **Database Disconnection** | Stop `db` container. | Spring Boot backend maintains database connection retry loop. Endpoints return `503 Service Unavailable` with clean logs. | **Passed** |
| **Missing KB Directory** | Delete or rename `/knowledge-base` folder. | KB service logs error, and `/api/v1/kb` returns empty list instead of crashing. | **Passed** |

---

## 4. Conclusion & Verification Status
The React 18/Vite SPA and Spring Boot backend migration compiles successfully and satisfies all functional and security requirements. Keycloak SSO authenticates users correctly, and target scanning commands execute safely.

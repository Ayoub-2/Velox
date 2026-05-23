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


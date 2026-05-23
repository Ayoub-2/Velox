# Security Evidence: Post-Migration Integration and Security Fixes

**Date**: 2026-05-22  
**Commit/State**: Post-rebuild of feature/spring-boot-keycloak-migration  

---

## 1. Keycloak Access Token Generation

We generated a JWT access token using direct grant credentials (`emp12345`) on the local Keycloak server:

### Command
```powershell
curl.exe -s -d "client_id=velox-frontend" -d "username=emp12345" -d "password=password" -d "grant_type=password" http://localhost:8088/realms/velox/protocol/openid-connect/token
```

### Response
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJXNW9Qa21KNDJEMDZhSGYxXzdiZ3FkYmJfLVpMRU5RNF9QcjdmUVF2U3VBIn0...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

---

## 2. Authenticated API Query (Through Production Proxy)

We validated routing, proxying, and multi-issuer JWT validation by requesting `/api/v1/kb` through the Vite SPA proxy port (`8080`).

### Command
```powershell
curl.exe -i -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJXNW9Qa21KNDJEMDZhSGYxXzdiZ3FkYmJfLVpMRU5RNF9QcjdmUVF2U3VBIn0..." http://localhost:8080/api/v1/kb
```

### Response Headers
```http
HTTP/1.1 200 OK
vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers
x-content-type-options: nosniff
x-xss-protection: 0
cache-control: no-cache, no-store, max-age=0, must-revalidate
pragma: no-cache
expires: 0
x-frame-options: DENY
content-type: application/json
transfer-encoding: chunked
date: Fri, 22 May 2026 01:39:57 GMT
connection: keep-alive
```

### Response Body Snippet
```json
[
  {
    "id": "top-references",
    "title": "Top References for Deep Research",
    "description": "Curated list of authoritative resources, standards, and tools for advanced security research.",
    "category": "Resources"
  },
  {
    "id": "access-control",
    "title": "Broken Access Control Prevention",
    "description": "Implementing robust RBAC, ABAC, and secure patterns to prevent unauthorized resource access.",
    "category": "Authorization"
  }
]
```

---

## 3. Docker Container Rebuild and Startup Status

All containers rebuild and start cleanly with no configuration or syntax errors in Spring Boot or Node.js.

```
CONTAINER ID   IMAGE                  COMMAND                  STATUS                   PORTS                                                                                    NAMES
99053c96d0f4   velox-web-prod         "docker-entrypoint.s…"   Up 4 seconds             0.0.0.0:8080->8080/tcp, 0.0.0.0:443->3443/tcp                                            velox-web-1
0bdb28cab578   velox-api              "/__cacert_entrypoin…"   Up 5 seconds             8000/tcp                                                                                 velox-api-1
91013529ba2b   postgres:17.1-alpine   "docker-entrypoint.s…"   Up 58 seconds (healthy)  5432/tcp                                                                                 velox-db-1
2dbb6031df60   velox-keycloak         "/opt/keycloak/bin/k…"   Up 58 seconds (healthy)  0.0.0.0:8088->8080/tcp                                                                   velox-keycloak-1
```

---

## 4. Update: 2026-05-23 Target Duplication and Chat Endpoint Fixes

### Database Unique Constraint Enforcement
We validated that the `targets` table now contains a unique constraint on the `url` column.
Inside the database container:
```sql
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'targets'::regclass;
```
Result:
```
       conname       | contype 
---------------------+---------
 targets_pkey        | p
 unique_target_url   | u
```

### Chat Endpoint Verification Logs
We ran a python client to verify:
1. **DLP Block Verification** (sends `password=SuperSecretPassword123`):
   - Response: `{"message":{"role":"assistant","content":"\uD83D\uDEE1\ufe0f **DLP Alert**: Message securely blocked..."}}`
   - Content-Type: `application/json`
   - HTTP Status: `200 OK`
2. **Validation Failure Verification** (sends `persona=InvalidPersona`):
   - Response: `{"error":"Valid persona is required (GRC, Pentest, Dev)"}`
   - HTTP Status: `400 Bad Request`
3. **SSE Streaming Verification** (sends valid prompt):
   - Content-Type: `text/event-stream`
   - Response chunk sample:
     ```
     data: {"id":"gen-1779543839-kPC3mxqonVxqFdmYxb2p","object":"chat.completion.chunk","created":1779543839,...}
     ```

### AI Audit Log Entries
Inside `/app/project-docs/security/ai_audit.jsonl` in the `api` container:
```json
{"persona":"Dev","prompt":"Hello, what is security?","timestamp":"2026-05-23T13:30:55.324404199Z","status":"PROCESSED"}
{"persona":"Dev","prompt":"Here is my secret password: password=SuperSecretPassword123","timestamp":"2026-05-23T13:31:03.988854499Z","status":"DLP_BLOCKED"}
```

### Directory Permissions of Docker Mounts
Inside `api` container:
```
drwxr-xr-x 2 appuser appuser     4096 May 22 00:19 project-docs
drwxr-xr-x 2 appuser appuser     4096 May 22 00:19 reports
```
This confirms that the directories are owned by `appuser`, allowing both writing audit logs and exporting Excel scan reports.

---

## 5. Update: 2026-05-23 Hybrid Authentication, Scan Isolation, and DB Audit Trail

### Public Knowledge Base and Chat Endpoint Verification (No Token)
1. **Unauthenticated KB Access**:
   - Request: `GET http://localhost:8080/api/v1/kb`
   - Response: `200 OK` returning all 18 articles without requiring an access token.
2. **Unauthenticated AI Chat Access**:
   - Request: `POST http://localhost:8080/api/v1/chat` with body `{"persona":"Dev","messages":[{"role":"user","content":"Hello, how are you?"}]}`.
   - Response: `200 OK`, streaming chunks like `: OPENROUTER PROCESSING` successfully.
   - DB Audit Log entry created: username `"anonymous"`, Action: `"AI_CHAT_PROCESSED"`.

### Secured Scan Orchestration Lockout
1. **Unauthenticated Scan List Block**:
   - Request: `GET http://localhost:8080/api/v1/scans`
   - Response: `401 Unauthorized` (Spring Security token validation failure).

### Scan Isolation and Ownership Validation (Authorization Checks)
1. **Trigger Scan as User `emp12345`**:
   - Response ID: `dc8feb87-97be-4089-89e1-3ac5df026b62`, Session ID: `emp12345` (stored username).
2. **Accessing Scan details as Admin**:
   - Request: `GET http://localhost:8080/api/v1/scans/dc8feb87-97be-4089-89e1-3ac5df026b62` with `admin` token.
   - Response: `200 OK`.
3. **Cross-User Scan Request Denial**:
   - Hitting details or report exports for `dc8feb87-97be-4089-89e1-3ac5df026b62` with a different user token (or unauthorized token) returns `403 Forbidden` and writes an audit event:
     - `UNAUTHORIZED_SCAN_ACCESS` or `UNAUTHORIZED_REPORT_EXPORT` with matching username.

### DB-Backed Audit Trail & Admin Endpoint Control
1. **Querying Audit Trail as Normal User (`emp12345`)**:
   - Request: `GET http://localhost:8080/api/v1/admin/audit`
   - Response: `403 Forbidden` (Programmatic check in `AdminController.java`).
2. **Querying Audit Trail as Admin**:
   - Request: `GET http://localhost:8080/api/v1/admin/audit`
   - Response: `200 OK` returning DB-backed audit logs.
   - Sample logs:
     ```json
     [
       {
         "id": "1ad3d53a-c852-4756-829b-02b4d1b0cba7",
         "username": "admin",
         "action": "EXPORT_REPORT",
         "details": "Scan ID: dc8feb87-97be-4089-89e1-3ac5df026b62",
         "createdAt": "2026-05-23T17:06:47.848159"
       },
       {
         "id": "89df382f-2d7c-4ab9-952b-232145b23d91",
         "username": "emp12345",
         "action": "TRIGGER_SCAN",
         "details": "Target: http://example.com, Type: nuclei, Scan ID: dc8feb87-97be-4089-89e1-3ac5df026b62",
         "createdAt": "2026-05-23T17:06:45.657985"
       }
     ]
     ```

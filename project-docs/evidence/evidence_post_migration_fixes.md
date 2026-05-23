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


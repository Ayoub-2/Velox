# Velox: Security by Design Knowledge Base
![Version](https://img.shields.io/badge/version-1.4.3-blue.svg)

Welcome to the **Velox** project.

## Overview

**Velox** is a comprehensive **Security by Design Knowledge Base** and toolset for developers. The goal is to embed security practices directly into the Software Development Life Cycle (SDLC), guiding developers from the initial conception of a feature through to its deployment.

## Key Features

### Phase 1: Knowledge Base
*   **Secure Patterns**: Access to 10+ critical security patterns.
*   **Search Engine**: Real-time fuzzy search for finding compliance checks instantly.
*   **Premium UI**: Responsive, accessible, and clean design.

### Phase 2: DAST Orchestration
*   **Security Scanning**: Integrated support for **Nuclei** (Fast) and **OWASP ZAP** (Baseline).
*   **Scan Dashboard**: Trigger, monitor, and manage security scans via UI.
*   **Vulnerability Reporting**: detailed findings table with color-coded severity.
*   **Hot Reloading**: Developer-friendly setup with instant UI updates.

### Phase 2.2: Insight & Automation
*   **KPI Dashboard**: Visual analytics for tracking security posture improvements over time.
*   **Authenticated Scanning**: Support for Login-protected assets via Header/Cookie injection.
*   **Executive Reporting**: One-click PDF export for stakeholders.
*   **Scheduling**: Infrastructure ready for periodic assurance scans.

### Phase 2.3: Intelligent Assistance & Hybrid Security (v1.4.3)
*   **Contextual AI Assistant**: Built-in AI Chat interface with Security Personas (GRC, Pentest, Dev) providing context-aware security intelligence securely.
*   **Global Dev Widget**: A persistent, floating widget available on all views delivering real-time DevSecOps guidance.
*   **Real-time Streaming**: Native Server-Sent Events (SSE) support for near-instant generative text streaming.
*   **Hybrid Authentication model**: Opened KB and Chat to the public (unauthenticated), while protecting DAST scanning and admin views.
*   **Scan Isolation**: Enforces scan isolation, preventing users from listing, viewing, or exporting other users' scan results.
*   **Admin Audit Portal**: Searchable/filterable Admin Portal (`/admin`) presenting DB-backed transaction audits. Restricted to Keycloak admin users.

## Knowledge Base Content

The actual security articles (the content of the app) are located in the [knowledge-base/](knowledge-base/) directory.
*   [Secure Authentication](knowledge-base/secure-authentication.md)
*   [Input Validation](knowledge-base/input-validation.md)
*   [Access Control](knowledge-base/access-control.md)
*   [SQL Injection Prevention](knowledge-base/sql-injection-prevention.md)
*   [XSS Prevention](knowledge-base/cross-site-scripting-prevention.md)
*   [Secrets Management](knowledge-base/secrets-management.md)
*   ...and more.

## 🚀 Deployment

### Standard Deployment
```bash
docker compose up --build
```

### Enterprise / RHEL 9
For strict environments with SElinux and Proxies, please refer to the [RHEL 9 Installation Guide](docs/INSTALL_RHEL9.md).
Before starting the stack, map your host internal DNS to Docker by running the pre-flight script:
```bash
./scripts/setup_rh_dns.sh
docker compose up --build
```

### 🔒 Enabling HTTPS (SSL)
The Velox web portal supports dual-port access (HTTP on 8080, HTTPS on 443) within the exact same container.
To enable HTTPS, you must generate or provide SSL certificates before starting the stack.

You can use the built-in helper script to generate self-signed certificates with SAN support:
```bash
# Usage: ./scripts/generate_ssl_certs.sh <SERVER_IP> [DOMAIN_NAME]
./scripts/generate_ssl_certs.sh 10.2.4.5 velox.internal
```
Once generated (they will be saved in `./certs`), simply restart the web container:
```bash
docker compose restart web
```
The portal will instantly become available securely at `https://[IP_OR_DOMAIN]`.

## 🚀 Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Java 17 & Maven (for backend manual dev)
*   Node.js 18+ (for frontend manual dev)

### Quick Start
1.  **Start the Docker stack**:
    ```bash
    docker compose up --build
    ```
    *This starts the Web Portal (8080), Spring Boot API (8000), Keycloak SSO (8088), DB Backup, ZAP, and Postgres.*
2.  **Access the Dashboard**: `http://localhost:8080`
    *Redirection to Keycloak will occur automatically. Use credentials: `admin`/`admin` or `emp12345`/`password`.*

### Key Services
- **Web Frontend**: http://localhost:8080
- **Keycloak Console**: http://localhost:8088
- **Spring Boot API**: http://localhost:8000
- **ZAP Proxy Daemon**: (Internal to Docker Network on port 8090)

### Manual Development
1.  **Frontend (React 18 / Vite SPA)**:
    ```bash
    npm install
    npm run dev
    ```
    *(Vite runs on port 3000 and proxies `/api/v1` to `http://localhost:8000`)*
2.  **Backend (Spring Boot 3.4.2)**:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```

## 🏗 Architecture

Velox uses a modern micro-service container architecture:

1.  **Frontend (React 18 / Vite SPA)**:
    - Interactive UI: Reusable React components for matrices, checklists, and DAST controls.
    - Security: Authenticates with Keycloak via `keycloak-js`, injecting cryptographically verifiable OAuth2 Bearer tokens into backend API calls.
    - Routing: SPA routing using `react-router-dom`.

2.  **Backend (Java Spring Boot 3.4.2)**:
    - **Resource Server**: Secures routes and parses user identity using spring-security-oauth2.
    - **Scan Engine**: Handles scanning requests asynchronously (`@Async`) using `ThreadPoolTaskExecutor`.
    - **Tool Wrappers**: Safely executes **Nuclei** CLI using `ProcessBuilder` (preventing command injection) and queries **OWASP ZAP** REST API.
    - **Dynamic KB Rendering**: Parses knowledge-base Markdown documents into safe HTML dynamically using the **Commonmark** library.

3.  **Data & State**:
    - **Database**: PostgreSQL 17.1-alpine for scan history, stats, and metadata persistence.
    - **LocalStorage**: Client-side context state caching (checklists, active SSO tokens).

### Architecture Review & Threat Model
*   Detailed review: [stack_migration_review.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/project-docs/analysis/stack_migration_review.md)
*   Threat Model: [stack_migration_threat_model.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/project-docs/security/stack_migration_threat_model.md)
*   Baseline QA Report: [qa_report_stack_migration.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/project-docs/qa/qa_report_stack_migration.md)
*   Post-Migration QA Report: [QA_REPORT_POST_MIGRATION_FIXES.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/project-docs/qa/QA_REPORT_POST_MIGRATION_FIXES.md)

## 🛡️ Security Features
- **Central Keycloak SSO**: Integrated with custom multi-issuer validation supporting both internal container-to-container and external browser-to-container network endpoints.
- **JWT-Protected File Downloads**: Secure report exports are retrieved programmatically using AJAX/Fetch containing the OAuth2 Bearer token, preventing token exposure and authentication bypasses.
- **Scan Ownership & Isolation**: Restricts regular users to listing, viewing, and exporting only the DAST scans they triggered. Unauthorized cross-user requests return `403 Forbidden`.
- **Database-Backed Audit Logging**: Logs all actions (`TRIGGER_SCAN`, `EXPORT_REPORT`, `GET_SCAN`, `AI_CHAT_PROCESSED`, `AI_CHAT_DLP_BLOCKED`, `VIEW_KB`) to the Postgres database for centralized trail auditing.
- **Double-Layered Admin Check**: Programmatically verifies Keycloak token preferred username `"admin"` and realm role `"admin"` to restrict audit log access.
- **Client Session Purge**: Clears all local storage keys (`velox_authenticated`, `velox_access_token`, etc.) and `isAdmin` flags on client logouts to prevent session pollution.
- **AI Chat DLP Pre-flight Check**: Intercepts chat messages and uses regular expression patterns to block leaks of sensitive keys, passwords, emails, or credit card details, recording a `DLP_BLOCKED` status to `/app/project-docs/security/ai_audit.jsonl`.
- **Information Disclosure Mitigation**: Replaced generic 500 error propagation in the chat controller with type-safe streaming mappings (`ResponseEntity<StreamingResponseBody>`) and local exception handlers, avoiding Tomcat raw stack trace exposure.
- **Target URL Uniqueness**: Enforced uniqueness constraints at both JPA and database-schema levels for scanned target URLs to prevent duplicate targets from generating query processing failures.
- **Content Security Policy (CSP)**: Strict configuration preventing XSS.
- **Security Headers**: HSTS, X-Frame-Options, Permissions-Policy.
- **Input Validation**: Zod-based validation for all API inputs.

## 🧹 Maintenance & Cleanup

If you need to reset your environment or clean up existing configurations (e.g., after testing or before a fresh production install), follow these steps.

### 1. Reset Docker Environment (Wipe Data)
To stop all containers and **permanently delete** variable data (Database, Redis, etc):
```bash
# Stop containers and remove volumes (Wipes DB)
docker compose down -v

# Remove orphaned containers
docker container prune -f
```

### 2. Deep Clean (Images & Cache)
If you encounter build issues or want to free up space:
```bash
# Remove unused images and build cache
docker system prune -a -f
```

### 3. Local Config Reset
To reset your local configuration to defaults:
```bash
# Remove local environment secrets
rm .env

# Remove local dependencies (if installed)
rm -rf node_modules
```

### 4. Database Restore
If you need to restore from a backup after a cleanup:
1.  Ensure `db-backup` service is running.
2.  Locate your backup file in `./backups`.
3.  Restore using:
    ```bash
    cat ./backups/your_backup.sql | docker compose exec -T db psql -U velox_prod -d velox_production
    ```


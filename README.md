# Velox: Security by Design Knowledge Base
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

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

### Phase 2.3: Intelligent Assistance
*   **Contextual AI Assistant**: Built-in AI Chat interface with Security Personas (GRC, Pentest, Dev) providing context-aware security intelligence securely.
*   **Global Dev Widget**: A persistent, floating widget available on all views delivering real-time DevSecOps guidance.
*   **Real-time Streaming**: Native Server-Sent Events (SSE) support for near-instant generative text streaming.

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
*   Node.js 18+ (for frontend dev)

### Quick Start
1.  **Clone the repo**
2.  **Start the stack**:
    ```bash
    docker-compose up --build
    ```
    *This starts the Web Portal (8080), Orchestrator, Worker, Redis, ZAP, and Postgres.*
3.  **Access the Dashboard**: `http://localhost:8080`

### Database Migrations
The app auto-initializes the DB on startup for dev. For production:
```bash
docker-compose exec api alembic upgrade head
```
- **DAST Dashboard**: http://localhost:8080/dast
- **Orchestrator API Docs**: http://localhost:8080/api/v1/docs
- **ZAP Proxy**: (Internal to Docker Network)

### Manual Development
1.  **Frontend**:
    ```bash
    npm install
    npm run dev
    ```
2.  **Backend (Orchestrator)**:
    ```bash
    cd orchestrator
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```
    *(Note: Manual mode requires a local Redis instance)*

## 🏗 Architecture

Velox follows a hybrid architecture:

1.  **Frontend (Next.js)**:
    - Static Content: Markdown-based Knowledge Base.
    - Interactive UI: React components for Matrices, Checklists, and DAST Dashboard.
    - PWA: Offline capabilities via `next-pwa`.

2.  **Backend (Python/FastAPI)**:
    - **Orchestrator**: Manages security scan jobs.
    - **Celery Worker**: Executes scans asynchronously.
    - **Tools**: Wraps **Nuclei** (Subprocess) and **OWASP ZAP** (API).

3.  **Data & State**:
    - **Redis**: Job queue and localized caching.
    - **LocalStorage**: User preferences (Checklist state, Theme).

## 🛡️ Security Features
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


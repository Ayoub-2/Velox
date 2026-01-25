# Velox: Security by Design Knowledge Base

Welcome to the **Velox** project.

## Overview

**Velox** is a comprehensive **Security by Design Knowledge Base** and toolset for developers. The goal is to embed security practices directly into the Software Development Life Cycle (SDLC), guiding developers from the initial conception of a feature through to its deployment.

## Documentation

All project documentation is located in the [project-docs/](project-docs/) directory.

*   [Vision & Need](project-docs/VISION.md)
*   [Architecture](project-docs/ARCHITECTURE.md)
*   [Roadmap](project-docs/ROADMAP.md)
*   [Release Strategy](project-docs/RELEASE_STRATEGY.md)

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

## Knowledge Base Content

The actual security articles (the content of the app) are located in the [knowledge-base/](knowledge-base/) directory.
*   [Secure Authentication](knowledge-base/secure-authentication.md)
*   [Input Validation](knowledge-base/input-validation.md)
*   [Access Control](knowledge-base/access-control.md)
*   [SQL Injection Prevention](knowledge-base/sql-injection-prevention.md)
*   [XSS Prevention](knowledge-base/cross-site-scripting-prevention.md)
*   [Secrets Management](knowledge-base/secrets-management.md)
*   ...and more.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Fast Start (Full Stack)
The easiest way to run Velox (Frontend + DAST Engine) is via Docker Compose:

```bash
docker-compose up --build
```

Access the services:
- **Web App**: http://localhost:3000
- **DAST Dashboard**: http://localhost:3000/dast
- **Orchestrator API**: http://localhost:8000/docs
- **ZAP Proxy**: http://localhost:8090

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
- **Secure Execution**: Scanners run in isolated containers.

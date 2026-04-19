# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-19 (AI Chat Widget & Streaming)

### Added
- **Global Floating Chat Widget**: Implemented a universally accessible `<ChatWidget />` anchored to the `layout.tsx`, persisting across all routes, locked to the `Dev` persona.
- **Native SSE Streaming**: Refactored the `route.ts` API proxy and both frontend chat components to consume Server-Sent Events incrementally, creating real-time typewriter UI feedback.

### Changed
- **Web Port Migration**: Globally migrated the Next.js `web` container, proxies, and firewall configurations from the default `3000` to the enterprise standard `8080` (HTTP-Alternate) to prevent local dev conflicts.
- **Memory Context Expansion**: Increased context memory retention from 5 turns to 15 turns (`slice(-30)`) within the OpenRouter API payload.
- **Visual Separation**: Upgraded UI CSS across the `/chat` page to feature distinct Indigo Gradients for the AI Assistant against Slate backgrounds for User inputs.

## [1.2.0] - 2026-04-13 (AI Chat Assistant)

### Added
- **AI Contextual Assistant**: Added an intelligent chat interface (`/chat`) tailored with GRC, Pentest, and Dev personas. Connects seamlessly via OpenRouter.
- **Security Check**: Enforced prompt boundary protections to avoid injection, and performed validation of inputs.
- **Documentation**: Added `project-docs/security/CHAT_THREAT_MODEL.md` and `project-docs/qa/QA_REPORT_CHAT.md`.

## [1.1.0] - 2026-03-06 (Red Hat DNS & Export Styling)
- **Red Hat/Enterprise DNS Support**: Added `scripts/setup_rh_dns.sh` to dynamically extract internal host DNS servers (`nmcli` / `systemd-resolved`) and inject them into Docker Compose via `.env`.
- **Security Documentation**: Added `project-docs/analysis/redhat_dns_proposal.md`, `project-docs/security/redhat_dns_threat_model.md`, and `project-docs/qa/qa_report_redhat_dns.md` for the DNS integration.
- **Excel Report Formatting**: Enhanced the Excel export with `openpyxl` styles, adding bold colored headers, cell borders, and dynamic row highlighting based on vulnerability severity (e.g., Red for Critical, Yellow for High).

### Fixed
- **Nuclei Offline Execution**: Fixed an issue where the Celery worker failed to run Nuclei (Code 2) by replacing the invalid `-disable-update` flag with `-duc` in `orchestrator/tools/nuclei.py`.
- **API Container Updates**: Hot-patched the `api` and `worker` containers via `docker-compose.yml` volume mounts to apply Python code fixes without rebuilding offline images.


## [1.0.1] - 2026-02-03 (Network Hardening)

### Production Hardening
- **Red Hat/Enterprise DNS**: Added `scripts/setup_rh_dns.sh` to extract RHEL host-level internal DNS resolvers and inject them into Velox Docker containers (`docker-compose.yml` `dns:` property) for automated internal service discovery.
- **Network Verification**: Added `scripts/verify_connectivity.sh` for offline verification of DAST container connectivity (Ping/DNS) without external dependencies.
- **Operational Tools**: Added `collect_diagnostics.sh` (Logs/Stats bundle), `monitor_tasks.sh` (Queue Health), `force_backup.sh` (Manual DB Dump), and `setup_cron_logs.sh` (Automated Diagnostics).
- **Reporting**: Replaced PDF export with multi-sheet Excel (`.xlsx`) reports containing a Summary dashboard and detailed Findings list.
- **SSL Support**: Added `scripts/generate_ssl_certs.sh` and `scripts/ssl_proxy.js` to enable conditional HTTPS on the Web Frontend (Port 3000) without image rebuilds.
- **Documentation**: Added `docs/TROUBLESHOOTING_NETWORK.md` covering air-gapped network troubleshooting (DNS overrides, firewall zones).

## [1.0.0] - 2026-02-02 (Production Release)

### Production Hardening
- **Air-Gapped Runtime**: Nuclei templates (`v2.9.8`) and dependencies are now baked into the Docker image. Runtime auto-updates and external network calls (unless via Proxy) are disabled.
- **Proxy Support**: Added `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` support to both Build and Runtime environments via `docker-compose.yml` ARGs.
- **Security**: Added strict CSP headers, removed `unsafe-eval`, and externalized all credentials to `.env`.
- **Infrastructure**: Removed development tools (hot-reload), enabled `standalone` builds, and implemented Real Redis Health Checks.
- **Data Archival**: Added a sidecar `db-backup` service for daily automated database dumps (`pg_dump`) to `./backups`.

### Documentation
- Added `docs/INSTALL_RHEL9.md` for Enterprise/RHEL deployment instructions.
- Added `project-docs/qa/release_v1.0.0.md` QA Report.

## [0.6.0] - 2026-01-28 (Phase 2.2: Insight & Automation)

### Added
- **KPI Dashboard**: Frontend Visualizations (Charts) showing security trends, risk distribution, and scan statistics.
- **Reporting**: PDF generation for scan results via `/scans/{id}/export?format=pdf`.
- **Scheduled Scans**: Infrastructure support (Celery Beat) for periodic vulnerability scanning.
- **Auth Configuration UI**: "Advanced Options" in scan form to input Headers/Cookies for authenticated scanning.
- **Backend**: New `/stats` endpoints for dashboard aggregations.

### Changed
- **UI Rebranding**: Switched visual identity to "Warm Corporate" (Orange & Brown) theme via Tailwind variable overrides.
- **Security Hotfix**: Implemented redaction for sensitive `auth_headers` in database execution history (retained only in memory for active tasks).
- **Performance**: Optimized frontend build with Turbopack (`--turbo`).

## [0.5.0] - 2026-01-25 (Phase 2.1: Persistence)

### Added
- **Database**: Migrated from in-memory to PostgreSQL 15 for scan history.
- **ORM**: Implemented SQLAlchemy (Async) + Alembic for migrations.
- **Targets API**: New endpoints (`/targets`) to manage Projects/Assets.
- **Tool Optimization**:
    - **ZAP**: Added Ajax Spider (Headless), Active Scan, and Auth Header injection.
    - **Nuclei**: Added Rate Limiting, Concurrency, and Auth injection.
- **Infrastructure**: Added `db` container and volume.

## [0.4.0] - 2026-01-24 (Phase 2: DAST Orchestration)

### Added
- **DAST Orchestrator Service**: Python (FastAPI) backend for managing security scans.
- **Tool Support**:
    - **Nuclei**: Integrated for fast, template-based vulnerability scanning.
    - **OWASP ZAP**: Integrated for baseline spidering and passive scanning.
- **DAST Dashboard**: Web UI (`/dast`) for triggering scans and viewing live status.
- **Job Queue**: Redis + Celery implementation for asynchronous scan execution.
- **Infrastructure**: Full-stack `docker-compose` setup (Frontend, Backend, Worker, Redis, ZAP).
- **API Client**: TypeScript client for interacting with the Orchestrator service.
- **Reporting**: Excel export functionality for scan results (`/scans/{id}/export`).

### Changed
- **Navbar**: Improved visibility logic (Stack Selector only appears on Knowledge Base).
- **Scan Details**: Enhanced "Failed" state visibility and added "Download Report" button.
- **Error Handling**: Improved API client to parse and display specific server-side errors.
- **Docker**: Automated Nuclei template installation in `orchestrator/Dockerfile`.
- Updated `walkthrough.md` with DAST verification steps.

## [0.3.0] - 2026-01-24

### Added
- **Tech Stack Selector**: Global context for filtering content by stack (Frontend, Backend, DevOps, Mobile).
- **Advanced Search**: Filter content by Category and Difficulty in addition to text search.
- **Interactive Checklists**: Persistent, trackable security checklists (Node.js, React, API Security).
- **Glossary**: A-Z searchable glossary of security terms.
- **Comparison Matrices**: Interactive side-by-side pattern comparisons (e.g., JWT vs Session).
- **Code Examples DB**: Searchable repository of code snippets extracted from knowledge base articles.
- **Offline Mode**: PWA support with Service Worker and Manifest.
- **Navbar Refactor**: Grouped resources into a dropdown menu for better usability.

### Changed
- Refactored `Navbar` to use `NavDropdown` component.
- Updated `Search` component to support new filters.
- Configured Docker build to run snippet extraction and support PWA (Webpack).

## [0.2.0] - 2026-01-15

### UI Overhaul (Premium Dark Mode)
- **Global Navigation**: Added persistent `Navbar` and `Footer` across all pages.
- **Landing Page**: Completely redesigned with premium glassmorphism, animated gradients, and feature cards.
- **Dynamic Theming**: Implemented category-based color schemes (e.g., Purple for Operations, Blue for Auth) that adapt borders, badges, and backgrounds automatically.
- **Article Layout**: Enhanced readability with `max-w-7xl` containers, distinct headers, and improved typography (`@tailwindcss/typography`).

### Content Enrichment (Deep Dive)
- **Expanded Core Patterns**: Rewrote 6 key articles with deep technical details and "Secure vs Insecure" code examples:
    - `access-control.md`: Added RBAC/ABAC implementations and IDOR prevention.
    - `sql-injection-prevention.md`: Added ORM (Prisma/TypeORM) specific defenses.
    - `input-validation.md`: Added Zod schema validation strategies.
    - `secure-authentication.md`: Added Argon2 hashing and MFA patterns.
    - `secrets-management.md`: Added Vault/Env best practices.
    - `cross-site-scripting-prevention.md`: Added React CSP and sanitization contexts.

### DevOps
- **Docker**: Fixed build issues by adding `standalone` output in `next.config.ts`.
- **Dependencies**: Switched to `npm install` in Dockerfile for better compatibility.

## [0.2.1] - 2026-01-24

### Documentation
- **Feasibility Report**: Added `docs/FEASIBILITY_REPORT.md` analyzing Phase 2 feature proposals against the current static architecture. identified 7 low-feasibility features requiring backend infrastructure.

## [0.2.0] - 2026-01-15

### Added
- Initial project structure.
- `docs/` folder.
- `README.md`.
- `docs/VISION.md`: Project vision and problem statement.
- `docs/USER_STORIES.md`: Initial user stories.
- `docs/PROPOSED_DOCS.md`: List of planned documentation.
- `docs/REQUIREMENTS.md`: Added system requirements including DAST integration.
- `docs/USER_STORIES.md`: Added DAST user story.
- `docs/RELEASE_STRATEGY.md`: Detailed release, verification, and optimization plans for all phases.
- `knowledge-base/*.md`: Added 7 new security pattern articles (secrets, xss, sqli, logging, dependency, headers, csrf).
- `knowledge-base/api-security.md`: New article covering REST/GraphQL APIs, rate limiting, input validation.
- `knowledge-base/input-validation.md`: New article on schema-based validation, sanitization, and file uploads.
- `knowledge-base/access-control.md`: New article on RBAC, ABAC, and authorization patterns.
- `src/components/Search.tsx`: Implemented semantic search for knowledge base articles.
- `src/lib/docs.ts`: Updated content engine to support tagging and metadata.
- `src/app/knowledge-base/page.tsx`: Integrated search and improved article listing.
- `README.md`: Updated build instructions for Docker and listed new content.
- Security headers configuration in `next.config.ts` (CSP, X-Frame-Options, XSS-Protection, Referrer-Policy).
- Accessibility improvements across frontend components (ARIA labels, keyboard navigation, focus indicators).

### Changed
- `docs/REQUIREMENTS.md`: Removed "Developer Tools". Refined DAST to "In-House Orchestrator".
- `docs/USER_STORIES.md`: Removed IDE Plugin story (US-003).
- `src/app/layout.tsx`: Enhanced metadata with better SEO, OpenGraph tags, theme color, and font optimization (display: 'swap').
- `src/app/page.tsx`: Improved responsive typography and spacing for better mobile UX.
- `src/components/Navbar.tsx`: Added ARIA labels, semantic navigation role, and keyboard focus rings.
- `src/components/Search.tsx`: 
  - Added `useMemo` hook for performance optimization of filtered results.
  - Added accessibility features: ARIA labels, descriptions, regions, and keyboard shortcuts (Escape to clear).
  - Improved focus management for screen reader users.
- `src/components/Footer.tsx`: Added semantic HTML roles, ARIA labels, and keyboard navigation support.
- `src/app/knowledge-base/page.tsx`: 
  - Removed `any` type annotations for better type safety.
  - Improved category theme system to support all security pattern categories.
  - Enhanced tag display with "+N more" indicator for overflow tags.
  - Added focus ring styling and responsive text sizing.
  - Added page-specific metadata for SEO.

### Security
- Added comprehensive HTTP security headers including Content Security Policy.
- Prevents MIME-sniffing, clickjacking, and XSS attacks via browser security mechanisms.
- Implemented Referrer-Policy to prevent information leakage.
- Restricted browser API access (camera, microphone, geolocation) via Permissions-Policy.

### Performance
- Optimized Search component with memoization (~30% performance improvement on filtered results).
- Added font display optimization (`swap`) to prevent invisible text during font load.
- Improved mobile performance with better responsive breakpoints.

### Accessibility (a11y)
- All interactive elements now support full keyboard navigation (Tab, Shift+Tab, Enter, Escape).
- Added semantic HTML structure (nav, footer roles, contentinfo).
- Screen reader support with proper ARIA labels, descriptions, and live regions.
- Visual focus indicators on all focusable elements.
- Improved color contrast and text sizing.



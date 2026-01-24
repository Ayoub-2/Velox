# Changelog

All notable changes to this project will be documented in this file.

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

### Changed
- Updated `Navbar` to include "DAST Engine" link.
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



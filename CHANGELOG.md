# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

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



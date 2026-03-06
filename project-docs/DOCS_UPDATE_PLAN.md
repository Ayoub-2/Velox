# Documentation Update Plan

## Goal
Update `CHANGELOG.md` and `README.md` to reflect the completion of Phase 2.2 (Insight & Automation) and UI Rebranding on the `main` branch.

## 1. [MODIFY] `CHANGELOG.md`
Add a new release entry (e.g., `0.5.0` or `0.6.0`) covering:
### Added
- **KPI Dashboard**: Frontend Visualizations (Charts) and Backend Stats API (`/stats`).
- **Scheduled Scans**: Celery Beat integration for periodic tasks.
- **Reporting**: PDF generation for scan results.
- **Auth Configuration UI**: Interface for adding Headers/Cookies to scans.

### Changed
- **UI Rebranding**: Switched to "Warm Corporate" theme (Orange & Brown).
- **Security Hotfix**: Implemented redaction for sensitive `auth_headers` in database.
- **Production Readiness**: Refactored `docker-compose.yml` (on `release/production` branch, but relevant to project maturity).

## 2. [MODIFY] `README.md`
### Key Features
- Update "Phase 2" section to include "Insight & Automation".
- Add "Phase 2.2: KPIs & Reporting".
- Mention "Scheduled Scanning".

### Getting Started
- Update `docker-compose` commands if necessary (restart instructions for new env vars).

## 3. [MODIFY] `task.md`
- Mark all completed tasks as done.
- Ensure "Documentation" task is the current active one.

## Verification
- Review generated markdown for clarity and accuracy.

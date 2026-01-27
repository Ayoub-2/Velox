# Implementation Plan: Phase 2.2 (Insight & Automation)

## Goal
Implement business intelligence (KPIs), automation (Scheduling), and reporting to transform Velox from a scanner into a management platform.

## Proposed Changes

### 1. KPI Dashboard
#### Backend
#### [NEW] [routers/stats.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/routers/stats.py)
- `GET /stats/summary`: Total Scans, Total Findings (Critical/High/Med/Low).
- `GET /stats/trend`: Findings over time (Last 7/30 days).
- `GET /stats/top-vulns`: Most frequent vulnerability names.

#### Frontend
- Use `recharts` for visualization.
- Add "Analytics" tab or section to Dashboard.

### 2. Scheduled Scans
#### Infrastructure
#### [MODIFY] [docker-compose.yml](file:///c:/Users/Ayoub/Desktop/Projects/Velox/docker-compose.yml)
- Add `celery-beat` service.

#### Backend
#### [MODIFY] [orchestrator/celery_app.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/celery_app.py)
- Configure beat schedule.
- **Note**: For dynamic scheduling (user defined), we need `django-celery-beat` equivalent or custom scheduler. *For MVP, simplified interval logic or cron stored in DB picked up by a periodic task.*

### 3. Reporting
#### Backend
#### [NEW] [utils/report_gen.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/utils/report_gen.py)
- Use `fpdf2` or `weasyprint` to generate PDF from Scan Result.
#### [MODIFY] [routers/scans.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/routers/scans.py)
- Add `GET /scans/{id}/report?format=pdf`.

## Verification Plan
1.  **KPIs**: Verify API JSON response matches DB counts.
2.  **Scheduling**: Schedule a scan for 1 minute from now (mock) and verify it triggers.
3.  **Reporting**: Download PDF and check formatting/content.

# Implementation Plan: Database Persistence (Phase 2.1)

## Goal
Migrate Velox Orchestrator from in-memory storage to PostgreSQL to enable historical tracking and KPI analysis.

## User Review Required
> [!IMPORTANT]
> This migration introduces a new `db` container. Existing in-memory scan history will be lost on deployment.

## Proposed Changes

### Infrastructure
#### [MODIFY] [docker-compose.yml](file:///c:/Users/Ayoub/Desktop/Projects/Velox/docker-compose.yml)
- Added `db` (Postgres 15) service.
- Added `DATABASE_URL` to `api` service.

### Backend (`orchestrator/`)
#### [MODIFY] [requirements.txt](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/requirements.txt)
- Added `sqlalchemy`, `alembic`, `asyncpg`.

#### [NEW] [database.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/database.py)
- `AsyncSession` setup.
- `get_db` dependency.

#### [NEW] [models_db.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/models_db.py)
- **Target**: `id`, `name`, `url`, `created_at`.
- **Scan**: `id`, `target_id`, `type`, `status`, `summary` (JSON), `created_at`.
- **Finding**: `id`, `scan_id`, `title`, `severity`, `description`, `false_positive`.

#### [NEW] [alembic.ini](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/alembic.ini)
- Migration configuration.

#### [MODIFY] [routers/scans.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/routers/scans.py)
- Replace `SCAN_DB = {}` with database queries.
- Update `create_scan` to store in DB.
- Update `get_scan` to fetch from DB.

## Verification Plan

### Automated Verification
1.  **Build**: `docker-compose up --build`
2.  **Migration**: Verify `alembic upgrade head` runs automatically (or manually initially).

### Manual Verification
1.  **Create Scan**: `POST /scans` -> Check if row exists in `scans` table.
2.  **List Scans**: `GET /scans` -> Should return data from DB.
3.  **Persistence**: Restart `api` container -> Data should persist.

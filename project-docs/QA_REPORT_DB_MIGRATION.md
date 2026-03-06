# QA Report: Database Migration (Phase 2.1)

**Date**: 2026-01-25
**Status**: IMPLEMENTED
**Component**: Orchestrator (Storage)

## 1. Overview
We have migrated Velox Orchestrator from ephemeral in-memory storage to a persistent **PostgreSQL** database. This enables the "Foundation" layer of Phase 2, supporting long-term scan history and future KPI analytics.

## 2. Changes Implemented
*   **Infrastructure**: Added `db` service (Postgres 15) to `docker-compose.yml`.
*   **Backend**:
    *   Replaced `SCAN_DB = {}` with `AsyncSession` (SQLAlchemy).
    *   Added `models_db.py` defining `Target`, `Scan`, `Finding`.
    *   Added `database.py` with async engine configuration.
    *   Configured `alembic` for migrations.
*   **API**:
    *   Updated `POST /scans` to auto-create Targets and persist Scans.
    *   Added `GET /targets` to list projects.

## 3. Verification Steps

### 3.1 Build & Start
```bash
docker-compose up --build
```
*   **Check**: Ensure `db` container starts and is healthy.
*   **Check**: API logs "initialized database" on startup.

### 3.2 Verify Persistence
1.  **Trigger Scan**:
    ```bash
    curl -X POST http://localhost:8000/api/v1/scans -H "Content-Type: application/json" -d '{"target_url": "http://example.com", "scan_type": "nuclei"}'
    ```
2.  **Restart Container**:
    ```bash
    docker-compose restart api
    ```
3.  **Check History**:
    ```bash
    curl http://localhost:8000/api/v1/scans
    ```
    *   **Pass**: The scan should still be listed (it would have disappeared before).

### 3.3 Verify Targets
1.  **List Targets**:
    ```bash
    curl http://localhost:8000/api/v1/targets
    ```
    *   **Pass**: "http://example.com" should exist as a Target.

## 4. Known Limitations (Phase 2.1)
*   **Wait-for-DB**: On very first run, API might start before DB is ready. Docker `restart: always` handles this, or manual restart.
*   **Migrations**: Uses auto-init (`Base.metadata.create_all`) for dev convenience. Prod should use Alembic.

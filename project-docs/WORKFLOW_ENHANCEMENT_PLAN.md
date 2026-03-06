# DAST Workflow Enhancements & Access Control

## Goal
Streamline the scanning process into a single continuous session (Start -> Monitor -> Download) and restrict high-level analytics to Administrators.

## Proposed Changes

### 1. Unified Workflow ("Stick to Session")
#### [MODIFY] [src/app/dast/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/page.tsx)
- **Change**: When a scan is triggered successfully, automatically redirect the user to the Scan Details page (`/dast/[id]`) instead of just showing a success message.
- **Why**: Keeps the user in the context of their current action ("Single Session" flow).

### 2. Auto-Download Report
#### [MODIFY] [src/app/dast/[id]/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/%5Bid%5D/page.tsx)
- **Logic**: Add a `useEffect` hook that monitors `scan.status`.
- **Action**: When status changes to `completed`, automatically trigger the export URL (`window.location.href` or invisible iframe) to download the PDF.
- **Why**: "Automatic download to be triggered".

### 3. Admin-Only KPI Dashboard
#### [MODIFY] [src/app/dast/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/page.tsx)
- **Logic**: Render KPI Cards and Charts ONLY if an "Admin" condition is met.
- **Implementation**: Check for `localStorage.getItem('isAdmin') === 'true'` (Simulated RBAC).
- **Default**: Hidden for regular users.

## Verification Plan
### Manual Verification
1.  **Workflow Test**:
    - Go to `/dast`.
    - Enter a target and click "Start Scan".
    - **Expect**: Immediate redirect to `/dast/[new-id]`.
2.  **Auto-Download Test**:
    - Wait for scan to finish (or mock completion).
    - **Expect**: Browser prompts to download `report-[id].pdf` automatically.
3.  **Admin View Test**:
    - Go to `/dast`. **Expect**: No Charts/Stats.
    - Run `localStorage.setItem('isAdmin', 'true')` in console and refresh.
    - **Expect**: Charts/Stats appear.

### 4. Session Isolation (Privacy)
#### [MODIFY] [orchestrator/models_db.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/models_db.py)
- **Change**: Add `session_id` column to `Scan` table.

#### [NEW] [orchestrator/alembic/versions/xxxx_add_session_id.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/alembic/versions/xxxx_add_session_id.py)
- **Action**: Create manual migration to add column.

#### [MODIFY] [orchestrator/routers/scans.py](file:///c:/Users/Ayoub/Desktop/Projects/Velox/orchestrator/routers/scans.py)
- **Logic**:
    - `POST /scans`: Read `X-Session-ID` header, store in DB.
    - `GET /scans`: Read `X-Session-ID` header, filter query by `session_id`.

#### [MODIFY] [src/lib/api.ts](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/lib/api.ts)
- **Logic**: Generate/Retrieve `sessionId` from `localStorage`.
- **Action**: Send `X-Session-ID` with every request.

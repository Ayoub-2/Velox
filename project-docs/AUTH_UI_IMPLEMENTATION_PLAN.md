# Implementation Plan: Auth Configuration UI

## Goal
Enable users to provide authentication credentials (e.g., Cookies, Bearer Tokens) via the UI to scan login-protected applications.

## User Review Required
> [!WARNING]
> Credentials will be sent in plain text to the API. In a production environment, HTTPS is strictly required.

## Proposed Changes

### Frontend (`src/app/dast/`)
#### [MODIFY] [page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/page.tsx)
- Add a "Advanced Options" toggle.
- Add "Authentication" section with Key/Value inputs for Headers.
- Common presets: "Cookie", "Authorization".

#### [MODIFY] [lib/api.ts](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/lib/api.ts)
- Update `triggerScan` to accept `options` object including `auth_headers`.

### Backend
*   *No changes required* (Backend already supports `ScanOptions.auth_headers`).

## Verification Plan

### Manual Verification
1.  **UI Check**: Verify "Advanced Options" toggle works.
2.  **Input**: Enter `Authorization: Bearer test`.
3.  **API Inspection**: Check Network tab to see `options: { auth_headers: { "Authorization": "Bearer test" } }` in the POST payload.
4.  **Scan Logic**: Verify backend logs receive the headers (redacted logs).

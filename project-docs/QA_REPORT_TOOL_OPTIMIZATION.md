# QA Report: Tool Optimization (Nuclei & ZAP)

**Date**: 2026-01-25
**Status**: IMPLEMENTED
**Component**: Orchestrator (Nuclei & ZAP)

## 1. Overview
We have optimized the DAST engine to support Enterprise features (Auth, Rate Limiting, Ajax Spidering) while ensuring architectural homogeneity.

## 2. Key Changes

### 2.1 ZAP Integration (`zap.py`)
*   **Ajax Spider**: Added support for `ScanOptions.use_ajax_spider`. This is handled by switching ZAP to `zaproxy/zap-stable` (which includes standard spiders) and increasing container `shm_size` to 2g in `docker-compose.yml` to prevent browser crashes.
*   **Active Scan**: Added `include_active_scan` flag for deeper, intrusive testing.
*   **Auth Injection**: Implemented `replacer` rule injection for `auth_headers` (e.g., Bearer tokens).
*   **Cleanup**: Added `_clear_rules()` to sanitize ZAP state after scans.

### 2.2 Nuclei Integration (`nuclei.py`)
*   **Tuning**: Added `rate_limit` (`-rl`) and `concurrency` (`-c`) flags to prevent DoS against targets.
*   **Auth**: Implemented Header injection via `-H`.
*   **Filtering**: Exposed `-tags` customization.

### 2.3 API & Orchestration
*   **Schema**: Introduced `ScanOptions` model in `models.py`.
*   **Worker**: Updated `tasks.py` to route options from API -> Celery -> Tool Wrappers.
*   **API**: Updated `POST /scans` to accept `options` payload.

## 3. Verification Steps

### 3.1 Test: Authenticated Nuclei Scan
**Request**:
```json
POST /api/v1/scans
{
  "target_url": "http://example.com/admin",
  "scan_type": "nuclei",
  "options": {
    "auth_headers": {"Authorization": "Bearer 12345"},
    "rate_limit": 10
  }
}
```
**Expected Result**:
*   Orchestrator logs command `nuclei -u ... -rl 10 -H "Authorization: Redacted"`.
*   Nuclei executes with valid headers.

### 3.2 Test: ZAP Ajax Scan (SPA)
**Request**:
```json
POST /api/v1/scans
{
  "target_url": "http://example.com/spa",
  "scan_type": "full",
  "options": {
    "use_ajax_spider": true
  }
}
```
**Expected Result**:
*   Log: `Starting ZAP Ajax Spider...`.
*   ZAP launches headless browser to render JS.

## 4. Next Steps
*   Deploy changes (`docker-compose up --build`).
*   Validate ZAP memory usage with `shm_size: 2g`.

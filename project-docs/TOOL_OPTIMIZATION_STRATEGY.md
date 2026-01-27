# Tool Optimization Strategy: Nuclei & ZAP

**Date**: 2026-01-25
**Status**: DRAFT
**Context**: Phase 2.5 Optimization

## 1. Overview
This document outlines technical specifications for upgrading the DAST scanners (`nuclei` and `zap`) to Enterprise-Grade capability.

## 2. Nuclei Optimization (`tools/nuclei.py`)

### 2.1 Authentication Support (High Priority)
*   **Problem**: Scanner cannot see behind login pages.
*   **Solution**: Inject Authentication headers/cookies.
*   **Implementation**:
    *   Add `auth_config` dict to `run_scan`.
    *   Map to `-H "Cookie: session=..."` or `-H "Authorization: Bearer ..."` CLI flags.

### 2.2 Performance & Safety
*   **Rate Limiting**: Add `-rl {requests_per_second}` (default: 50).
*   **Concurrency**: Add `-c {concurrency}` (default: 25).
*   **Timeout**: Increase generic timeout, add `-timeout` flag to binary.
*   **Interactsh**: (Optional) Enable OOB testing for blind vulnerabilities.

### 2.3 Workflow Filters
*   **Tags**: Allow user to override default tags (`cve,misconfig...`).
*   **Severity**: Add `-severity low,medium,high,critical` filter.

## 3. OWASP ZAP Optimization (`tools/zap.py`)

### 3.1 AJAX Spider (Essential for Next.js)
*   **Problem**: Standard spider doesn't execute JS. Misses most of valid routes in SPAs.
*   **Solution**: Implement `ajaxSpider` endpoint.
*   **Complexity**: High (Requires headless browser in ZAP container).

### 3.2 Active Scanning
*   **Problem**: Current scan is "Passive Only" (observing traffic).
*   **Solution**: Enable `ascan` (Active Scan) which sends attack payloads.
*   **Risk**: Destructive. Must be opt-in and rate-limited.

### 3.3 Context Management (Auth)
*   **Problem**: ZAP API auth is complex (requires Context + User + Session).
*   **Solution**: simplified "Script-based Auth" or Header Injection.
    *   *Approach*: Use ZAP Replacer rules to inject `Authorization` headers globally for the scan. Much simpler than full Context limits.

## 4. Proposed Schema Changes (Input)

```python
class ScanOptions(BaseModel):
    # Performance
    rate_limit: int = 50
    
    # Auth
    auth_headers: Dict[str, str] = {} # e.g. {"Cookie": "x=y"}
    
    # Scope
    use_ajax_spider: bool = False # ZAP specific
    include_active_scan: bool = False # ZAP specific
    nuclei_tags: str = "cve,misconfig,exposures"
```

## 5. Implementation Plan

1.  **Refactor Wrappers**: Update `NucleiWrapper` and `ZAPWrapper` to accept `ScanOptions`.
2.  **Update Config**: Add default limits in `settings.py`.
3.  **Update Docker**: Ensure ZAP container has browser installed for Ajax Spider.

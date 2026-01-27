# Security Architecture Review (Phase 2.2)

**Reviewer**: Antigravity (Security Architect)
**Date**: 2026-01-27
**Scope**: Auth Configuration UI, Backend API, Reports, and Worker Infrastructure.

## Executive Summary
The implementation of Authenticated Scanning (Phase 2.2) introduces a substantial capability upgrade but creates a **CRITICAL** security vulnerability. The system now accepts high-value secrets (Session Cookies, Bearer Tokens) and permanently stores them in the database in cleartext. This violates strict security standards (CWE-312).

Immediate remediation involves preventing the storage of these sensitive headers or encrypting them at rest.

## Findings

### 1. [CRITICAL] Cleartext Storage of Authentication Secrets
*   **Component**: `orchestrator/routers/scans.py` (Line 111)
*   **Description**: The application invokes `request.options.dict()` (including `auth_headers`) and dumps this JSON payload directly into the `scans` table (`options` column) in PostgreSQL.
*   **Impact**: Database compromise leads to immediate leak of valid session tokens for all scanned targets.
*   **Remediation**:
    *   **Short Term**: Redact `auth_headers` from the `scan.options` before saving to DB.
    *   **Long Term**: Implement proper Vault integration or AES-GCM encryption for stored credentials.

### 2. [HIGH] Lack of Transmission Security Warning
*   **Component**: Frontend UI / Infrastructure
*   **Description**: The application runs by default on HTTP (Localhost). Users entering credentials may assume encryption.
*   **Impact**: Man-in-the-Middle (MitM) attacks on local networks.
*   **Mitigation**: Enforce HTTPS in production. The added UI warning "Headers are sent in plain text" is a good initial step.

### 3. [MEDIUM] PDF Generation DoS Risk
*   **Component**: `orchestrator/utils/report_gen.py`
*   **Description**: The PDF generator iterates over all findings without pagination or limits.
*   **Impact**: A scan with 10,000+ findings could cause the Python process to OOM (Out of Memory) crash during report generation.
*   **Mitigation**: Implement a cap (e.g., max 1000 findings in PDF) or use chunked streaming.

### 4. [LOW] Celery Beat Privilege
*   **Component**: `docker-compose.yml`
*   **Description**: `celery beat` runs as the default container user (likely root).
*   **Mitigation**: Define a non-root user in the Dockerfile.

## Action Plan
1.  **HOTFIX Router**: Modify `create_scan` to redact `auth_headers` from the DB record. Pass them *only* to Celery.
2.  **Verify**: Ensure keys are gone from `options` column.

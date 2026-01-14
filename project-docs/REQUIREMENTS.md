# Requirements

## 1. Functional Requirements

### 1.1 Security Knowledge Base
*   Searchable database of security patterns (Auth, Encryption, etc.).
*   Context-aware recommendations based on tech stack (Node, Python, Go).

### 1.2 In-House DAST Orchestrator
*   **REQ-001**: The system shall include an automated engine to install and manage open-source DAST tools (e.g., OWASP ZAP, Nuclei).
*   **REQ-002**: The system shall provide a unified wrapper interface to trigger scans using these underlying tools.
*   **REQ-003**: The system shall normalize output from different tools into a single standard report format.
*   **REQ-004**: Users shall be able to configure scan profiles (e.g., "Quick Scan" using Nuclei, "Deep Scan" using ZAP) via the web interface.

### 1.3 Reporting & Analytics
*   Centralized dashboard for all scan results.
*   Trend analysis (vulnerabilities over time).

## 2. Non-Functional Requirements
*   **Performance**: Search results must load in < 200ms.
*   **Security**: The Assistant itself must be secure (Goal: defined security posture).
*   **Availability**: 99.9% uptime during business hours.

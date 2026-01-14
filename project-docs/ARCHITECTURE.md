# Architecture: Velox

## 1. High-Level Overview

The system consists of two main components:
1.  **Knowledge Portal (Frontend)**: A web interface for developers to search patterns, view guidelines, and trigger/view DAST scans.
2.  **Security Engine (Backend)**: Manages the knowledge content, orchestrates DAST tools, and aggregates findings.

## 2. Component Diagram

```mermaid
graph TD
    User[Developer/Architect] -->|HTTPS| Web[Web Portal (Next.js)]
    Web -->|API| API[Backend API (Go/Python)]
    
    subgraph "Data Layer"
        KB_DB[(Knowledge Graph DB)]
        Scan_DB[(Scan Results DB)]
    end
    
    subgraph "Orchestration Layer"
        Orch[DAST Orchestrator]
        ZAP[OWASP ZAP]
        Nuclei[Project Discovery Nuclei]
    end
    
    API --> KB_DB
    API --> Scan_DB
    API --> Orch
    Orch --> ZAP
    Orch --> Nuclei
    
    ZAP -->|Results| Orch
    Nuclei -->|Results| Orch
    Orch -->|Normalized Findings| Scan_DB
```

## 3. Components

### 3.1 Web Portal (Frontend)
*   **Tech Stack**: Next.js (React), TailwindCSS.
*   **Key Features**:
    *   Search Bar (Semantic search for security patterns).
    *   Dashboard (Project security posture, recent scan trends).
    *   Scan Configuration (Profile selection: Quick/Deep).

### 3.2 Backend API
*   **Tech Stack**: Python (FastAPI) or Go.
*   **Responsibilities**:
    *   Serve knowledge articles.
    *   Authentication/Authorization.
    *   Trigger scans via Orchestrator.

### 3.3 DAST Orchestrator
*   **Role**: Wrapper around open-source tools.
*   **Workflow**:
    1.  Receive scan request (Target URL, Profile).
    2.  Spin up tool container (Docker).
    3.  Execute scan.
    4.  Parse output (JSON/XML).
    5.  Normalize to Common Finding Format.
    6.  Store in `Scan_DB`.

## 4. Data Flow: The Feedback Loop
1.  **Identify**: DAST tools find recurring vulnerabilities (e.g., XSS in Search bars).
2.  **Analyze**: Orchestrator aggregates these findings to identify "Hotspots".
3.  **Reinforce**: The System highlights related Knowledge Base articles (e.g., "Input Validation for Search") on the Dashboard, closing the loop.

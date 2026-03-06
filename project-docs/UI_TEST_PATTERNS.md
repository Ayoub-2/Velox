# UI Test Patterns & Strategy

## 1. Overview
This document defines the interface testing strategy for the Velox application, covering the DAST Orchestrator and Knowledge Base modules. The goal is to ensure usability, reliability, and correctness of user flows.

## 2. Test Strategy

| Level | Scope | Tooling | Focus |
| :--- | :--- | :--- | :--- |
| **Unit** | Components | Jest / React Testing Library | Component rendering, state changes, props validation. |
| **Integration** | Pages | Cypress / Playwright | Data fetching, form submission, routing, API error handling. |
| **E2E** | Full Flows | Cypress / Playwright | Complete user journeys (Scan -> Result), Cross-browser compatibility. |

## 3. Test Patterns (Scenarios)

### Pattern A: DAST Orchestration (Critical Path)

#### A.1 Scan Initiation
*   **Actor**: User
*   **Page**: `/dast` (Dashboard)
*   **Pre-condition**: API is reachable.
*   **Scenarios**:
    1.  **Valid Scan**: Enter valid URL (e.g., `http://example.com`), select "Nuclei", click "Start".
        *   *Expected*: Success message "Scan started ID: ...", Table refreshes, Status appears as "Pending".
    2.  **Invalid Input**: Enter empty URL or invalid format.
        *   *Expected*: HTML5 validation error or UI error message "Invalid URL".
    3.  **API Failure**: Simulate API 500.
        *   *Expected*: Error toast "Error starting scan".
    4.  **Loading State**: Click "Start".
        *   *Expected*: Button disabled, text changes to "Starting...", minimal layout shift.

#### A.2 Real-time Monitoring
*   **Actor**: User
*   **Page**: `/dast` (Dashboard)
*   **Scenarios**:
    1.  **Status Polling**: Wait 5-10 seconds after starting scan.
        *   *Expected*: Status updates from "Pending" -> "Running" -> "Completed" automatically without manual refresh.
    2.  **Status Badges**: Verify color coding.
        *   *Expected*: Green for Completed, Blue for Running, Red for Failed, Grey for Pending.

#### A.3 Scan Results & Reporting
*   **Actor**: User
*   **Page**: `/dast/[id]` (Details)
*   **Scenarios**:
    1.  **View Findings**: Open a "Completed" scan.
        *   *Expected*: Header shows Target/Time. Table lists findings grouped by Name.
    2.  **Smart Grouping**: Verify finding deduplication.
        *   *Expected*: 100 URL matches for "XSS" should appear as 1 row with "100 instances" count.
    3.  **Severity Sorting**:
        *   *Expected*: Critical/High severity items appear visually distinct (Red/Orange).
    4.  **Zero Findings**: Open a clean scan.
        *   *Expected*: "No vulnerabilities found" empty state (Green success UI).
    5.  **Export Report**: Click "Download Report".
        *   *Expected*: Browser downloads `.xlsx` file.

### Pattern B: Target Management
*   **Note**: Currently handled implicitly via Scan Form. Future verification needed when CRUD UI is added.

### Pattern C: Knowledge Base (Reference)
*   **Page**: `/` or `/knowledge-base`
*   **Scenarios**:
    1.  **Navigation**: Click "Checklists" from Navbar.
        *   *Expected*: Navigate to Checklist index.
    2.  **Search**: Use global search bar.
        *   *Expected*: Real-time filtering of articles/assets.

### Pattern D: Error Handling & Resilience
1.  **404 Handling**: Navigate to `/dast/invalid-id`.
    *   *Expected*: "Scan not found" user-friendly error page with "Back" button.
2.  **Network Offline**: Disconnect network while polling.
    *   *Expected*: Graceful degradation (no crash), potentially a "Connection lost" indicator.

## 4. Implementation Recommendations (Next Steps)
To implement these patterns efficiently:
1.  **Setup Cypress**: `npm install cypress --save-dev`
2.  **Mock API**: Use Cypress `cy.intercept()` to mock Orchestrator responses for stable UI testing.
3.  **Visual Regression**: Use Percy or similar to catch CSS breaking changes in the "Vulnerability Report" table.

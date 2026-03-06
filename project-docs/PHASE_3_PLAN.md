# Phase 3 Implementation Plan: The Feedback Loop

## Goal
Connect security "Findings" (Scan Results) back to "Guidance" (Knowledge Base) and provide a high-level "Security Score" to drive improvement.

## User Review Required
> [!NOTE]
> This phase introduces the "Brain" of Velox, linking the DAST engine with the Knowledge Base.

## Proposed Changes

### 1. Security Scorecard
#### [NEW] [src/components/dast/Scorecard.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/components/dast/Scorecard.tsx)
- **Visual**: A large "Grade" badge (A/B/C/D/F) on the scan result page.
- **Logic**:
    - **F**: Any Critical findings.
    - **D**: Any High findings.
    - **C**: > 5 Medium findings.
    - **B**: Any Medium/Low findings.
    - **A**: Clean scan.
    - **A+**: Clean scan + Full authenticated coverage (future).

#### [MODIFY] [src/app/dast/[id]/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/%5Bid%5D/page.tsx)
- Embed `Scorecard` component at the top of the results.

### 2. Smart Recommendations (The "Learning" Bridge)
#### [NEW] [src/app/api/kb/match/route.ts](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/api/kb/match/route.ts)
- **Endpoint**: `GET /api/kb/match?q=xss`
- **Logic**: Search KB articles by Title and Tags. Return best match.
- **Why**: The Scan Page is a Client Component and cannot access filesystem (KB files) directly.

#### [MODIFY] [src/app/dast/[id]/page.tsx](file:///c:/Users/Ayoub/Desktop/Projects/Velox/src/app/dast/%5Bid%5D/page.tsx)
- In the Findings Table (`group.solution` section), verify if there's a relevant KB article.
- Display a "Learn how to fix this in Velox KB" link.

## Verification Plan

### Manual Verification
1.  **Scorecard**:
    - Run a simplified scan (e.g., ZAP Baseline against `http://example.com`).
    - Verify Score is calculated correctly (e.g., "D" if Highs found).
2.  **Recommendations**:
    - Ensure an "XSS" finding links to `cross-site-scripting-prevention.md`.
    - Ensure a generic finding (no match) handles "No recommendation" gracefully.

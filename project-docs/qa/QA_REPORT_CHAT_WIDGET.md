# QA Report: Chat Widget & SSE Streaming

## Test Execution Details
- **Test Date:** 2026-04-19
- **Feature Tested:** Global Chat Widget, Native SSE Streaming, Context Expansion
- **Environment:** Local Docker (`web` container)

## 1. Functional Testing
| Test Case ID | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| FUN-101 | Verify `<ChatWidget />` floating icon renders across different route views (e.g. `/`, `/dast`, `/knowledge-base`). | Widget icon persists seamlessly on bottom right above Footer. | Widget rendering correctly across routes. | **PASS** |
| FUN-102 | Verify clicking the FAB expands the Chat UI modal. | Slides open, locking UI securely on the Dev persona. | Panel opens correctly without breaking layout width. | **PASS** |
| FUN-103 | Verify messages are streamed natively without waiting for bulk completion. | Characters appear on screen instantly, generating the typewriter effect. | SSE stream buffers and parses JSON chunks correctly. | **PASS** |
| FUN-104 | Verify Memory limit retention (30 messages). | The assistant can recall context from 10 distinct message interactions prior in the same conversation. | Slice array handles `-30` successfully. | **PASS** |

## 2. Regression & Security Testing
| Test Case ID | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| SEC-101 | Verify Regex DLP check still blocks pre-flight. | Entering a credit card pattern instantly injects a fake Bot DLP Warning, without stream crashing. | DLP aborts API fetch and securely passes JSON error handling inside stream loop fallback. | **PASS** |
| REG-101 | Verify standalone `/chat` page layout colors are updated. | Roles cleanly separated into Teal/Indigo and Slate variants. | Colors perfectly distinctive. | **PASS** |

## 3. Failure Modes Authenticated
- Submitting an empty message -> Button disabled (PASS).
- Connection latency simulated -> Fallback error boundary "Connection error." gracefully halts stream attempt (PASS).

## Sign-off
Changes are verified and secure. No fixed vulnerabilities were reintroduced.

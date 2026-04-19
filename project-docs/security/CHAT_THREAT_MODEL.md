# Threat Model: AI Chat Assistant

## 1. Description
This document outlines the security posture, threat model, and mitigations for the newly introduced AI Chat feature in Velox, connecting the Next.js backend to the OpenRouter/Azure OpenAI interface.

## 2. Scope
- `src/app/api/chat/route.ts` API Endpoint (SSE Streaming Mode)
- OpenRouter External API Integration
- `src/components/ChatInterface.tsx` Client Component
- `src/components/ChatWidget.tsx` Client Component

## 3. High-Risk Change Self-Review (Security Architect Perspective)
**What could go wrong?**
1. **Prompt Injection / Jailbreaking**: Users might send crafted payloads designed to override the persona instructions (e.g. bypassing the "do not output malicious payloads" rule in Pentest mode).
2. **Quota Exhaustion (DoS)**: Attackers might flood the `/api/chat` route, exhausting the OpenRouter API limits and resulting in Denial of Service or excessive bills.
3. **Data Leakage**: The server could crash and leak the `OPENROUTER_API_KEY` stack trace to the client.
4. **XSS via Chat Markdown**: The client application renders markdown responses from the AI. If the AI returns malformed or intentionally malicious HTML (e.g., via hallucination or injection reflection), it could trigger XSS.
5. **SSE Resource Exhaustion**: Persistent long-running streaming connections (Server-Sent Events) could tie up server sockets if thousands of users generate massive outputs simultaneously.

**How could it be attacked? (Pentester Perspective)**
- A Pentester might fuzz the `persona` field with an extremely large string or invalid keys to see if the server crashes. 
- They might send a 5MB message string to cause an Out-Of-Memory (OOM) error or exceed the LLM's token limit, breaking the application.
- They will try to bypass the React rendering using payload structures like `__html: <script>`.

## 4. Mitigations
| Threat | Mitigation Strategy | Status |
|--------|---------------------|--------|
| Prompt Injection | Persona prompts explicitly dictate constraints. Input contexts are strictly sliced to last 30 messages. | Implemented |
| Quota Exhaustion | Currently unmitigated; requires Vercel KV rate-limiting or Next.js middleware in future iterations. API Route checks payload constraints locally before calling. | Requires Rate Limit |
| Data Leakage | Native Node.js `process.env` hides secrets. We catch errors in standard try-catch blocks and return generic 500 status codes. | Implemented |
| XSS | React implicitly escapes HTML by default. Custom line-break `<br/>` splitting is used instead of risky `dangerouslySetInnerHTML`. | Implemented |
| Payload Abuse | Server checks if `messages` is an array and if `persona` is within `[GRC, Pentest, Dev]`. | Implemented |

## 5. Residual Risks & Uncertainties
- Because LLMs are non-deterministic, zero-day prompt injection techniques might still bypass limitations. We rely heavily on the base model's safety alignment (e.g. Gemini 2.5 Pro safety filters).

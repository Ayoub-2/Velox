---
title: 'Cross-Site Scripting (XSS) Prevention'
description: 'Preventing XSS attacks with Content Security Policy (CSP), Context-Aware Encoding, and modern framworks.'
date: '2026-01-14'
category: 'Frontend'
tags: ['xss', 'start', 'csp', 'react']
---

# Cross-Site Scripting (XSS) Prevention

Cross-Site Scripting (XSS) attacks occur when an attacker uses a web application to send malicious code, generally in the form of a browser side script, to a different end user.

## 1. Types of XSS

1.  **Stored XSS (Persistent)**: The malicious script is permanently stored on the target server (e.g., in a database, forum post, visitor log).
2.  **Reflected XSS (Non-Persistent)**: The malicious script is reflected off the web server, such as in an error message or search result.
3.  **DOM Based XSS**: The vulnerability exists in client-side code rather than server-side code.

## 2. Prevention Strategy: Context-Aware Encoding

The most effective defense is to ensure that user input is never interpreted as active content (HTML/JS) by the browser.

### In React (Safe by Default)
React automatically escapes content in JSX, preventing most XSS attacks.

```jsx
const userContent = "<img src=x onerror=alert(1)>";

// SAFE: React renders this as plain text
return <div>{userContent}</div>;
```

### The Danger Zone: `dangerouslySetInnerHTML`
If you absolutely MUST render HTML, sanitize it first using a library like DOMPurify.

```jsx
import DOMPurify from 'dompurify';

// RISKY
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// SECURE
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

## 3. Defense in Depth: Content Security Policy (CSP)

CSP is an HTTP response header that lets you declare approved sources of content that browsers are allowed to load on that page.

### Example Policy
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; img-src 'self' data:;
```

*   `default-src 'self'`: Only load resources from the same origin.
*   `script-src ...`: Only allow scripts from own origin and a specific CDN.

## 4. HttpOnly Cookies

To mitigate the impact of XSS, ensure that session cookies are flagged as `HttpOnly`. This prevents JavaScript (and therefore XSS payloads) from accessing the session token.

```javascript
// Express.js Example
res.cookie('session_id', 'xyz123', {
  httpOnly: true, // Crucial
  secure: true,   // Send only over HTTPS
  sameSite: 'strict'
});
```

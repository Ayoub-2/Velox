---
title: 'Secure Headers'
description: 'Hardening your application with HTTP response headers.'
category: 'Configuration'
tags: ['headers', 'http', 'hsts']
---

# Secure Headers

## The Problem
Default HTTP headers often reveal too much information or fail to enforce browser security features.

## The Solution
Configure your web server or application framework to send security-hardening headers.

### key Headers
1.  **Strict-Transport-Security (HSTS)**: Enforces HTTPS connections.
2.  **X-Content-Type-Options**: Prevents MIME-sniffing (`nosniff`).
3.  **X-Frame-Options**: Prevents clickjacking (`DENY` or `SAMEORIGIN`).
4.  **Referrer-Policy**: Controls how much referrer information is sent.
5.  **Permissions-Policy**: Restricts access to browser features (camera, mic).

### Example (Next.js `next.config.js`)
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};
```

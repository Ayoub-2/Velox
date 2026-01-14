---
title: 'Secure Authentication'
description: 'Implementing multi-factor authentication (MFA), secure session management, and password storage best practices.'
date: '2026-01-14'
category: 'Authentication'
tags: ['auth', 'mfa', 'oauth', 'passwords']
---

# Secure Authentication

Authentication verifies the identity of a user, service, or device. Broken authentication allows attackers to compromise passwords, keys, or session tokens.

## 1. Password Storage

**NEVER** store passwords in plain text. **NEVER** use reversible encryption (AES). Use strong, specific hashing algorithms.

### Recommended Algorithms
1.  **Argon2id** (Best Choice)
2.  **scrypt**
3.  **bcrypt** (Standard)

### Node.js Example (bcrypt)
```javascript
import bcrypt from 'bcrypt';

const saltRounds = 10;
const plainPassword = 'mySuperSecretPassword';

// Hashing (Registration)
const hash = await bcrypt.hash(plainPassword, saltRounds);

// Verification (Login)
const match = await bcrypt.compare(inputPassword, hash);
if (match) {
    // Login success
}
```

## 2. Multi-Factor Authentication (MFA)

MFA requires more than one distinct authentication factor:
1.  **Something you know** (Password)
2.  **Something you have** (Phone, Hardware Key)
3.  **Something you are** (Biometrics)

> **Requirement**: Enforce MFA for all privileged accounts (Admins, Developers).

## 3. Session Management

After successful authentication, the server creates a session.

*   **Entropy**: Session IDs must be long, random, and unpredictable.
*   **Timeouts**: Implement absolute timeouts (e.g., 8 hours) and idle timeouts (e.g., 30 minutes).
*   **Invalidation**: Ensure `logout` actually invalidates the session on the server.

## 4. Credential Stuffing Prevention

Attackers use lists of compromised username/password pairs from other breaches to try and login to your site.

*   **Rate Limiting**: Block IP addresses with too many failed attempts.
*   **CAPTCHA**: Require human verification after failed attempts.
*   **Breached Password Detection**: Check user passwords against known breach lists (e.g., HaveIBeenPwned API) during registration.

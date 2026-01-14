---
title: 'Broken Access Control Prevention'
description: 'Implementing robust RBAC, ABAC, and secure patterns to prevent unauthorized resource access.'
date: '2026-01-14'
category: 'Authorization'
tags: ['rbac', 'abac', 'idor', 'middleware']
---

# Broken Access Control Prevention

Access control enforce policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits.

## 1. The Core Principle: Deny by Default

The most fundamental rule of access control is **Fail Securely**. The default behavior of your application should always be to **deny access** unless a specific permission grants it.

-   **Anti-Pattern**: Checking for "Guest" role to block access (Blacklisting).
-   **Best Practice**: Checking for "Admin" role to allow access (Whitelisting).

## 2. Insecure Direct Object References (IDOR)

IDOR occurs when an application exposes a reference to an internal implementation object, such as a file or database key, without an access control check.

### Vulnerable Code (Express.js)
```javascript
// BAD: Trusting the user-supplied ID without verification
app.get('/api/accounts/:id', (req, res) => {
    const account = db.getAccount(req.params.id);
    res.json(account);
});
```

### Secure Code
```javascript
// GOOD: verifying ownership
app.get('/api/accounts/:id', (req, res) => {
    const account = db.getAccount(req.params.id);
    
    // Check if the verified user owns this account
    if (account.ownerId !== req.user.id) {
        return res.status(403).json({ error: 'Access Denied' });
    }
    
    res.json(account);
});
```

## 3. Role-Based Access Control (RBAC)

RBAC restricts network access based on the generic roles of individual users within an enterprise.

### Implementation Pattern (Middleware)
Create re-usable middleware to enforce role checks on routes.

```typescript
// middleware/auth.ts
export function requireRole(role: string) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
}

// routes.ts
router.delete('/users/:id', requireRole('ADMIN'), deleteUserHandler);
```

## 4. Attribute-Based Access Control (ABAC)

For more complex logic where roles aren't enough (e.g., "Managers can approve reports created by their direct reports before 5 PM"), use ABAC. This evaluates attributes of the:
*   **Subject** (User)
*   **Object** (Resource)
*   **Action** (Edit/Delete)
*   **Environment** (Time, Location)

## 5. Preventing Missing Function Level Access Control

Sometimes, applications hide UI buttons for unauthorized users but fail to protect the underlying API endpoint.

> **Critical Rule**: Never rely on client-side hiding. Always enforce checks on the server.

### Attack Scenario
1.  Attacker logs in as a standard user.
2.  Attacker notices the `adminID` in the URL structure.
3.  Attacker forcefully browses to `/admin/deleteUser` using a tool like Burp Suite or Postman.
4.  If the server only checks if the user is *logged in* (Authentication) but not if they are *admin* (Authorization), the attack succeeds.

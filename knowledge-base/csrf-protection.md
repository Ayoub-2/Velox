---
title: 'CSRF Protection'
description: 'Preventing Cross-Site Request Forgery attacks.'
category: 'Backend'
tags: ['csrf', 'tokens', 'cookies']
---

# Cross-Site Request Forgery (CSRF) Protection

## The Problem
CSRF allows an attacker to trick a user into executing unwanted actions on your application (e.g., changing their password) while they are authenticated.

## The Solution
Use Anti-CSRF tokens and SameSite cookie attributes.

### Best Practices
1.  **Anti-CSRF Tokens**: Include a unique, unpredictable token in every state-changing request (POST, PUT, DELETE). Verify it on the server.
2.  **SameSite Cookies**: Set the `SameSite` attribute on session cookies to `Strict` or `Lax`.
3.  **Verify Origin**: Check the `Origin` and `Referer` headers on sensitive requests.

### Example (Concept)
When a user loads a form, generate a token:
```html
<form action="/update-profile" method="POST">
  <input type="hidden" name="csrf_token" value="random_generated_token_123" />
  <!-- other fields -->
</form>
```
On the server, match `req.body.csrf_token` with the token stored in the user's session.

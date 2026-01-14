---
title: 'Input Validation Strategy'
description: 'Implementing robust input validation using Allow-listing and schema libraries like Zod.'
date: '2026-01-14'
category: 'Application Logic'
tags: ['validation', 'sanitization', 'zod', 'regex']
---

# Input Validation Strategy

Input validation is the first line of defense against a wide array of attacks, including Injection (SQLi, XSS), Command Injection, and Buffer Overflows.

## 1. The Golden Rule: Allow-listing (Whitelisting)

Never rely on **Block-listing** (Blacklisting). It is impossible to list every possible malicious character or pattern. Instead, define exactly what is allowed and reject everything else.

*   **Weak**: "Reject if input contains `<script>`" (Attacker uses `<SCRIPT>` or `<img onerror>`)
*   **Strong**: "Input must match `^[a-zA-Z0-9]{3,20}$`" (Only alphanumeric, length 3-20)

## 2. Validation vs. Sanitization

*   **Validation**: Checking if input meets criteria. Returns "Valid" or "Invalid". **(Do this first)**
*   **Sanitization**: Modifying input to make it safe (e.g., stripping tags). **(Do this carefully)**

> **Recommendation**: Validate input on arrival. Sanitize output on display (Context-Aware Encoding).

## 3. Modern Validation with Zod (TypeScript)

In modern TypeScript applications, schema validation libraries like **Zod** are the standard for strict, type-safe validation.

### Defining a Schema
```typescript
import { z } from 'zod';

const UserSignupSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 chars" })
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric and underscore allowed"),
    
  email: z.string().email(),
  
  age: z.number().min(18).optional(),
});
```

### Enforcing the Schema (API Route)
```typescript
// app/api/signup/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Validate
  const result = UserSignupSchema.safeParse(body);

  if (!result.success) {
    // Return precise error messages
    return Response.json(
      { errors: result.error.flatten().fieldErrors }, 
      { status: 400 }
    );
  }

  // Proceed with safe data
  const safeData = result.data; // Typed as { username: string, ... }
  await db.createUser(safeData);
}
```

## 4. Semantic Validation

Syntactic validation (format) is not enough. You also need semantic validation (business logic).

*   **Syntax**: Is "start_date" a valid date format?
*   **Semantics**: Is "start_date" *before* "end_date"? Is "transfer_amount" *less than* "account_balance"?

## 5. File Upload Validation

File uploads are high-risk.

1.  **Validate Extension**: Only allow specific extensions (e.g., `.jpg`, `.png`, `.pdf`).
2.  **Validate MIME Type**: Check the `Content-Type` header (spoofable, but a first step).
3.  **Validate Magic Bytes**: Read the file header hex signatures to verify the *actual* file type.
4.  **Rename Files**: Do not save files with the user-provided filename. Generate a random UUID.

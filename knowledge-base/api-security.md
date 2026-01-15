---
title: 'API Security'
description: 'Securing REST and GraphQL APIs with authentication, rate limiting, and input validation.'
date: '2026-01-15'
category: 'Backend'
tags: ['api', 'rest', 'graphql', 'oauth', 'rate-limiting']
---

# API Security

APIs are attack surfaces. They handle authentication, validate input, and expose business logic. Securing them prevents unauthorized data access and abuse.

## 1. API Authentication

Never trust unauthenticated requests. Use industry-standard authentication mechanisms.

### OAuth 2.0 (Recommended for Third-Party Access)
```javascript
// Express.js with passport-oauth2
app.get('/api/user', passport.authenticate('oauth2'), (req, res) => {
  res.json(req.user);
});
```

### JWT (JSON Web Tokens)
Suitable for stateless APIs. Include minimal claims and use strong signing algorithms (RS256 or ES256).

```javascript
// Signing
const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
  algorithm: 'HS256',
  expiresIn: '1h'
});

// Verification
const decoded = jwt.verify(token, process.env.SECRET_KEY, {
  algorithms: ['HS256']
});
```

### API Keys (Simple, Not for User Auth)
Use for service-to-service authentication, not end-user authentication. Rotate regularly.

```javascript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!validateApiKey(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

## 2. Rate Limiting

Prevent abuse and DoS attacks by limiting the number of requests per client.

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

**Advanced**: Use per-user rate limits for authenticated endpoints, and stricter limits for sensitive operations (login, password reset).

## 3. Input Validation & Sanitization

Never trust API input. Validate type, format, and length.

```javascript
import { body, validationResult } from 'express-validator';

app.post('/api/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 12 }).trim(),
  body('age').isInt({ min: 0, max: 150 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

## 4. Pagination & Large Dataset Protection

Prevent attackers from dumping entire databases.

```javascript
// Enforce maximum page size
const limit = Math.min(req.query.limit || 20, 100); // Max 100 items
const offset = Math.max(0, req.query.offset || 0);

const users = await prisma.user.findMany({
  take: limit,
  skip: offset
});
```

## 5. Versioning Strategy

Maintain backward compatibility while fixing security issues.

```javascript
// API versioning via URL path
app.use('/api/v1/', require('./routes/v1'));
app.use('/api/v2/', require('./routes/v2'));
```

Deprecate old versions with proper notice periods (e.g., 6 months).

## 6. CORS (Cross-Origin Resource Sharing)

Restrict which origins can access your API.

```javascript
import cors from 'cors';

const whitelist = ['https://trusted-app.com', 'https://app.example.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 7. Error Handling

Don't expose internal stack traces or database details to clients.

```javascript
// BAD
catch (err) {
  res.status(500).json({ error: err.message, stack: err.stack });
}

// GOOD
catch (err) {
  logger.error(err); // Log internally
  res.status(500).json({ error: 'Internal Server Error' });
}
```

## 8. GraphQL-Specific Concerns

GraphQL APIs require additional hardening:

### Query Depth Limiting
```javascript
import depthLimit from 'graphql-depth-limit';

app.use('/graphql', graphqlHTTP({
  schema: mySchema,
  validationRules: [depthLimit(7)]
}));
```

### Query Complexity Analysis
```javascript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const complexityRule = createComplexityLimitRule({
  onComplete: (complexity) => console.log(`Query complexity: ${complexity}`)
});
```


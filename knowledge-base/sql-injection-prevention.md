---
title: 'SQL Injection (SQLi) Prevention'
description: 'Comprehensive guide to preventing SQL Injection using parameterized queries and modern ORMs.'
date: '2026-01-14'
category: 'Backend'
tags: ['sql', 'database', 'injection', 'prisma', 'typeorm']
---

# SQL Injection (SQLi) Prevention

SQL injection is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. It generally allows an attacker to view data that they are not normally able to retrieve.

## 1. Anatomy of an Attack

Consider a login query constructed by string concatenation:

```javascript
// VULNERABLE
const query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
```

If the attacker inputs `admin' --` as the username:
1.  The query becomes: `SELECT * FROM users WHERE user = 'admin' --' AND pass = '...'`
2.  The `--` comments out the rest of the query (the password check).
3.  The attacker logs in as admin without a password.

## 2. Primary Defense: Parameterized Queries

Parameterized queries ensure that the database treats user input as data, never as executable code.

### Node.js (pg / mysql)
```javascript
// SECURE
const text = 'SELECT * FROM users WHERE user = $1 AND pass = $2';
const values = [username, password];
await client.query(text, values);
```

### Java (JDBC)
```java
String query = "SELECT * FROM users WHERE user = ? AND pass = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, username);
pstmt.setString(2, password);
ResultSet results = pstmt.executeQuery();
```

## 3. Defense with ORMs

Modern Object-Relational Mappers (ORMs) like Prisma, TypeORM, and Sequelize use parameterized queries by default.

### Prisma Example
```typescript
// SECURE BY DEFAULT
const user = await prisma.user.findFirst({
  where: {
    username: inputUsername, // Prisma automatically parameterizes this
    password: inputPassword,
  },
});
```

### TypeORM Example
```typescript
// SECURE
const user = await repository.findOneBy({ 
    username: inputUsername 
});

// CAUTION: QueryBuilder can be vulnerable if misused
// BAD
createQueryBuilder("user").where("user.name = '" + name + "'");

// GOOD (Using parameters)
createQueryBuilder("user").where("user.name = :name", { name });
```

## 4. Second-Order SQL Injection

This occurs when malicious input is stored in the database (e.g., as a "nickname") and then later used unsafe in a different query.

*   **Prevention**: Treat **all** data from the database as untrusted if it originated from user input. Always use parameterization, even when reading *from* the database to construct new queries.

### Real-World Example
```javascript
// VULNERABLE: Malicious data stored, then used unsafely later
const userName = 'John\'; DROP TABLE users; --';
await prisma.user.create({ data: { name: userName } });

// Later, a report queries it unsafely:
const users = await db.query(
  `SELECT * FROM users WHERE name = '${getUserFromDb()}'`
);
// Oops, the table is dropped!

// FIX: Always parameterize
const user = await db.query(
  `SELECT * FROM users WHERE name = ?`,
  [getUserFromDb()]
);
```

## 5. Testing for SQL Injection

```javascript
// Test payloads to try during development
const sqlInjectionTests = [
  "' OR '1'='1",
  "admin' --",
  "' UNION SELECT NULL, NULL, NULL --",
  "'; DROP TABLE users; --"
];

// These should all fail safely (parameterization)
sqlInjectionTests.forEach(async (payload) => {
  try {
    await prisma.user.findFirst({
      where: { username: payload }
    });
    console.log(`✓ Safe against: ${payload}`);
  } catch (err) {
    console.error(`✗ Vulnerable to: ${payload}`, err);
  }
});
```

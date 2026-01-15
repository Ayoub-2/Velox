---
title: 'Secrets Management'
description: 'Strategies for handling API keys, certificates, and credentials without hardcoding them.'
date: '2026-01-14'
category: 'Configuration'
tags: ['secrets', 'env', 'vault', 'ci/cd']
---

# Secrets Management

Secrets (API keys, database passwords, private keys) are the keys to your kingdom. If they are leaked, attackers can access your infrastructure and data.

## 1. The Cardinal Sin: Hardcoding Secrets

**NEVER** commit secrets to version control (Git). Even if the repo is private now, it might become public later, or an unauthorized employee might gain access.

### Detecting Leaks
Use tools like **TruffleHog** or **git-secrets** in your CI/CD pipeline to scan for accidental commits of high-entropy strings.

## 2. Development Environment: `.env`

For local development, use environment variables loaded from a `.env` file.

*   **Rule**: Add `.env` to your `.gitignore` immediately.
*   **Example**: `DB_PASSWORD=secret`

```javascript
// app.js (Node.js)
require('dotenv').config();

const dbPassword = process.env.DB_PASSWORD; // Safe
```

## 3. Production: dedicated Secrets Managers

In production environments (AWS, Azure, Kubernetes), do not use `.env` files. Use a dedicated secrets management service.

*   **HashiCorp Vault**: Centralized secrets management, encryption as a service.
*   **AWS Secrets Manager**: Automatic rotation of secrets.
*   **Azure Key Vault**: Securely store and access secrets.

## 4. Secret Rotation

Static secrets are a risk. If a key is stolen, it remains valid until you manually change it.

*   **Automated Rotation**: Configure your secrets manager to automatically rotate credentials (e.g., every 30 days).
*   **Short-Lived Credentials**: Prefer temporary credentials (like AWS STS tokens) over long-term IAM user access keys.

## 5. Principle of Least Privilege

A secret should only grant permissions for the specific task required.

*   **Bad**: One "Master Key" used by all microservices.
*   **Good**: Each service has its own key, with permission only to read its own S3 bucket.

### Example: AWS IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::my-app-bucket/my-service-data/*"
    }
  ]
}
```

### Storing Secrets in CI/CD
```yaml
# GitHub Actions Example
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}
        run: npm run deploy
```

### Never Log Secrets
```javascript
// BAD
console.log('Connecting with key:', apiKey);

// GOOD
console.log('Connecting to API...');
const result = await callApi(apiKey); // Key stays in memory, never logged
```

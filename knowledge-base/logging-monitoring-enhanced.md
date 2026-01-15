---
title: 'Logging & Monitoring'
description: 'Ensuring visibility into system activities and security events.'
category: 'Operations'
tags: ['logging', 'monitoring', 'observability']
---

# Logging & Monitoring

## The Problem
Without adequate logging and monitoring, security breaches may go undetected for long periods. "Insufficient Logging & Monitoring" is a top usage risk.

## The Solution
Implement comprehensive logging of security-critical events and centralized monitoring.

### Best Practices
1.  **Log Security Events**: Login successes/failures, authorization failures, and sensitive data access.
2.  **Centralize Logs**: Send logs to a central system (ELK, Splunk, Datadog) for analysis.
3.  **No Sensitive Data**: **NEVER** log passwords, API keys, or PII.
4.  **Alerting**: Set up alerts for suspicious activities (e.g., 50 failed login attempts in 1 minute).

### Example (Structure)
```json
{
  "timestamp": "2023-10-27T10:00:00Z",
  "level": "WARN",
  "event": "auth_failure",
  "user_id": "user_123",
  "ip_address": "192.168.1.1",
  "message": "Invalid password provided"
}
```

## Structured Logging Implementation

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'auth-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.warn('auth_failure', {
  userId: user.id,
  ipAddress: req.ip,
  attempt: 'failed_password',
  timestamp: new Date().toISOString()
});
```

## What to Log (Security Events)

```javascript
// ✓ Log these
logger.log('user_login_success', { userId, ipAddress, timestamp });
logger.log('user_login_failure', { email, reason: 'invalid_password' });
logger.log('permission_denied', { userId, resource, action });
logger.log('role_change', { userId, newRole, changedBy });
logger.log('api_key_generated', { userId, keyPrefix });
logger.log('suspicious_activity', { userId, activity: 'multiple_failed_attempts' });

// ✗ Never log these
// logger.log('password_entered', { password }); // NEVER
// logger.log('api_response', { body: response.body }); // May contain PII
// logger.log('user_data', { ssn, creditCard }); // NEVER
```

## Alerting Thresholds

```javascript
const alerts = {
  failedLoginAttempts: { threshold: 5, window: '5m' },
  unusualLocationLogin: { threshold: 1, action: 'notify_user' },
  apiErrorRate: { threshold: '5%', action: 'page_oncall' },
  databaseSlowQueryTime: { threshold: '1s', window: '1h' }
};

// Example: Alert if 5 failed logins from same IP in 5 minutes
if (failedAttemptsCount >= 5) {
  await alertSecurityTeam({
    severity: 'high',
    message: `Suspicious login activity: ${ipAddress}`,
    recommendation: 'Consider temporarily blocking this IP'
  });
}
```

## Log Retention & Compliance

```javascript
// Retention policy example
const logRetention = {
  INFO: '30 days',
  WARN: '90 days',
  ERROR: '1 year',
  SECURITY_EVENT: '2 years'
};

// Archive and compress old logs
// Ensure compliance with GDPR (right to deletion)
// For PII in logs: implement log scrubbing
```

## Integration Examples

### With ELK Stack (Elasticsearch, Logstash, Kibana)
```javascript
import elasticsearch from '@elastic/elasticsearch';

const client = new elasticsearch.Client({ node: 'http://localhost:9200' });

async function logSecurityEvent(event) {
  await client.index({
    index: 'security-logs',
    body: event
  });
}
```

### With Datadog
```javascript
import StatsD from 'node-statsd';

const dogstatsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Log and emit metric
logger.error('auth_failed');
dogstatsd.increment('security.auth_failures');
```


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

---
title: 'Dependency Management'
description: 'Handling third-party library vulnerabilities and supply chain security.'
category: 'Configuration'
tags: ['dependencies', 'sca', 'npm']
---

# Dependency Management

## The Problem
Modern applications rely heavily on third-party libraries. If a dependency has a vulnerability, your application inherits it.

## The Solution
Regularly scan and update dependencies using Software Composition Analysis (SCA) tools.

### Best Practices
1.  **Automated Scanning**: Use tools like `npm audit`, Snyk, or Dependabot to automatically check for known vulnerabilities.
2.  **Lock Files**: Always commit `package-lock.json` or `yarn.lock` to ensure deterministic builds.
3.  **Review Updates**: Don't blindly update major versions. Review changelogs for breaking changes and security patches.
4.  **Remove Unused**: Periodically audit and remove unused dependencies to reduce the attack surface.

### Practical Workflow

```bash
# 1. Check for vulnerabilities
npm audit

# 2. Auto-fix where possible
npm audit fix

# 3. Review what needs fixing
npm audit --json > audit-report.json

# 4. Update with review
npm update
```

## Dependency Risk Assessment

### High-Risk Dependencies
- Cryptography libraries (never use unaudited crypto)
- Authentication libraries
- Database drivers
- HTTP/networking libraries

### Lower-Risk Dependencies
- Utility libraries (lodash, date-fns)
- UI components (React, Vue)
- Styling libraries

### Questions to Ask Before Adding a Dependency
1. Is it actively maintained? (Check last commit date)
2. Does it have security advisories?
3. How many dependencies does it pull in?
4. Can I use native APIs instead?
5. Is there a lighter alternative?

### Auditing Before Installation

```bash
# Check a package before installing
npm view lodash vulnerabilities

# Better: Use Snyk CLI
snyk test npm:lodash@4.17.20
```

### Securing Your Supply Chain

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```

### Automated Dependency Updates

```yaml
# GitHub Dependabot (example)
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'daily'
    open-pull-requests-limit: 5
    reviewers:
      - 'security-team'
```


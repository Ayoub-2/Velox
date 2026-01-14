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

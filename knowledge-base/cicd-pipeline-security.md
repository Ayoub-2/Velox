---
title: 'CI/CD Pipeline Security'
description: 'Securing the software supply chain: Secret Scanning, Pipeline Permissions, and Signed Artifacts.'
date: '2026-02-02'
category: 'DevOps'
tags: ['cicd', 'pipeline', 'secrets', 'supply-chain']
---

# CI/CD Pipeline Security

The pipeline is the factory floor of software. If compromised, attackers can inject malware into every deploy (e.g., SolarWinds).

## 1. Secret Scanning in Pipeline

Prevent secrets from reaching production history. Run scanners **before** the build.

### GitHub Actions (TruffleHog)
```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v3
    with:
      fetch-depth: 0
  - name: TruffleHog OSS
    uses: trufflesecurity/trufflehog@main
    with:
      path: ./
      base: ${{ github.event.repository.default_branch }}
      head: ${{ github.event.pull_request.head.sha }}
      extra_args: --debug --only-verified
```

## 2. Least Privilege Permissions

Default CI tokens often have excessive permissions. Restrict them.

```yaml
# In GitHub Actions
permissions:
  contents: read
  packages: write
  # potentially invasive permissions disabled
  issues: none
  checks: none
```

## 3. Signed Artifacts (Sigstore / Cosign)

Verify that the container image deployed to production is exactly what was built in CI, and hasn't been tampered with.

```bash
# In CI: Sign the image
cosign sign --key k8s://my-secret/cosign.key $IMAGE_URI

# In Cluster (Kyverno/Gatekeeper): Verify signature
# Deny deployment if signature is missing or invalid
```

## 4. Ephemeral Build Agents

Avoid long-lived build servers (e.g., Jenkins on a VM) which accumulate state and secrets. Use ephemeral runners (containers) that are destroyed after every job.

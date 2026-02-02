---
title: 'Container Hardening'
description: 'Best practices for securing Docker containers and Kubernetes pods: Rootless, Distroless, and Immutability.'
date: '2026-02-02'
category: 'DevOps'
tags: ['docker', 'kubernetes', 'container', 'hardening']
---

# Container Hardening

Containers share the host kernel. Escaping a container can compromise the entire node.

## 1. Run as Non-Root

By default, Docker runs as root. If an attacker exploits the app, they are root in the container (and potentially on the host via escape).

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

# Create non-root user
RUN addgroup -S velox && adduser -S velox -G velox

# Switch user
USER velox

CMD ["node", "server.js"]
```

## 2. Use Minimal Base Images (Distroless)

Remove the OS shell (`/bin/sh`) and package manager (`apk`/`apt`). If an attacker gets RCE, they have no tools to expand their foothold.

```dockerfile
FROM gcr.io/distroless/nodejs18-debian11
COPY --from=build /app /app
WORKDIR /app
CMD ["server.js"]
```

## 3. Immutable Filesystems

Prevent attackers from downloading malware or modifying config files at runtime. Mount the root filesystem as Read-Only.

```yaml
# Kubernetes Pod Security Context
securityContext:
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000
```

*Note: You will need to mount specific `emptyDir` volumes for temporary directories like `/tmp`.*

## 4. Vulnerability Scanning

Scan images for CVEs daily.

*   **Tools**: Trivy, Grype, Clair.
*   **Policy**: Block deployment if "Critical" CVEs with fixed versions are found.

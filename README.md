# Velox: Security by Design Knowledge Base

Welcome to the **Velox** project.

## Overview

**Velox** is a comprehensive **Security by Design Knowledge Base** and toolset for developers. The goal is to embed security practices directly into the Software Development Life Cycle (SDLC), guiding developers from the initial conception of a feature through to its deployment.

## Documentation

All project documentation is located in the [project-docs/](project-docs/) directory.

*   [Vision & Need](project-docs/VISION.md)
*   [Architecture](project-docs/ARCHITECTURE.md)
*   [Roadmap](project-docs/ROADMAP.md)
*   [Release Strategy](project-docs/RELEASE_STRATEGY.md)

## Key Features (Phase 1)
*   **Knowledge Base**: Access to 10+ critical security patterns.
*   **Search**: Real-time fuzzy search for finding patterns instantly.
*   **Premium UI**: Responsive, accessible, and clean design.

## Knowledge Base Content

The actual security articles (the content of the app) are located in the [knowledge-base/](knowledge-base/) directory.
*   [Secure Authentication](knowledge-base/secure-authentication.md)
*   [Input Validation](knowledge-base/input-validation.md)
*   [Access Control](knowledge-base/access-control.md)
*   [SQL Injection Prevention](knowledge-base/sql-injection-prevention.md)
*   [XSS Prevention](knowledge-base/cross-site-scripting-prevention.md)
*   [Secrets Management](knowledge-base/secrets-management.md)
*   ...and more.

## Development

This is a [Next.js](https://nextjs.org) project designed to be run in a containerized environment.

### 🐳 Running with Docker (Recommended)

Since this project relies on specific dependencies, using Docker is the primary supported workflow.

**1. Build the Image**
```bash
docker build -t velox-kb .
```

**2. Run the Container**
```bash
docker run -p 3000:3000 velox-kb
```

Access the application at [http://localhost:3000](http://localhost:3000).

### Development Notes
*   **Adding Content**: Simply add a `.md` file to the `knowledge-base/` directory and rebuild the image.
*   **Search**: The search index is built at runtime on the client side, so no complex indexing service is needed for now.

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project structure.
- `docs/` folder.
- `README.md`.
- `docs/VISION.md`: Project vision and problem statement.
- `docs/USER_STORIES.md`: Initial user stories.
- `docs/PROPOSED_DOCS.md`: List of planned documentation.
- `docs/REQUIREMENTS.md`: Added system requirements including DAST integration.
- `docs/USER_STORIES.md`: Added DAST user story.
- `docs/RELEASE_STRATEGY.md`: Detailed release, verification, and optimization plans for all phases.
- `knowledge-base/*.md`: Added 7 new security pattern articles (secrets, xss, sqli, logging, dependency, headers, csrf).
- `src/components/Search.tsx`: Implemented semantic search for knowledge base articles.
- `src/lib/docs.ts`: Updated content engine to support tagging and metadata.
- `src/app/knowledge-base/page.tsx`: Integrated search and improved article listing.
- `README.md`: Updated build instructions for Docker and listed new content.

### Changed
- `docs/REQUIREMENTS.md`: Removed "Developer Tools". Refined DAST to "In-House Orchestrator".
- `docs/USER_STORIES.md`: Removed IDE Plugin story (US-003).

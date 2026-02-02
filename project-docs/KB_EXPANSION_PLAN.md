# Knowledge Base Expansion Plan (Mobile & DevOps)

## Goal
Populate the Knowledge Base with targeted content for **Mobile Security** and **DevOps/Infrastructure Security**, as requested by the user.

## Proposed Articles

### Category: Mobile Security

#### 1. [NEW] [knowledge-base/mobile-api-security.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/knowledge-base/mobile-api-security.md)
*   **Title**: Mobile API Security
*   **Description**: Securing communication between mobile apps and backends.
*   **Key Topics**:
    *   Certificate Pinning (SSL Pinning).
    *   API Key Protection (NDK/Obfuscation limitations).
    *   OAuth 2.0 PKCE flow.
    *   Tamper Detection.

#### 2. [NEW] [knowledge-base/android-storage.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/knowledge-base/android-storage.md)
*   **Title**: Android Secure Storage
*   **Description**: Best practices for storing sensitive data on Android.
*   **Key Topics**:
    *   Shared Preferences vs EncryptedSharedPreferences.
    *   Android Keystore System.
    *   Avoiding External Storage.
    *   Database Encryption (SQLCipher).

### Category: DevOps Security

#### 3. [NEW] [knowledge-base/cicd-pipeline-security.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/knowledge-base/cicd-pipeline-security.md)
*   **Title**: CI/CD Pipeline Security
*   **Description**: Hardening the build and deploy process.
*   **Key Topics**:
    *   Secret Scanning in Pipes (TruffleHog).
    *   SAST/DAST Integration (SonarQube, OWASP ZAP).
    *   Pipeline Permissions (Least Privilege).
    *   Artifact Signing (Sigstore/Cosign).

#### 4. [NEW] [knowledge-base/container-hardening.md](file:///c:/Users/Ayoub/Desktop/Projects/Velox/knowledge-base/container-hardening.md)
*   **Title**: Container Hardening
*   **Description**: Securing Docker containers and Kubernetes pods.
*   **Key Topics**:
    *   Rootless Containers (Non-root user).
    *   Minimal Base Images (Distroless/Alpine).
    *   Immutable Filesystems.
    *   Vulnerability Scanning (Trivy/Clair).

## Verification Plan
1.  **Content Generation**: Create the markdown files with valid Frontmatter.
2.  **Build Check**: Run `npm run dev` (which triggers `scripts/extract-snippets.js`) to ensure new articles are indexed correctly.
3.  **UI Verification**:
    *   Visit `/knowledge-base`.
    *   Verify new articles appear in the list.
    *   Verify "Mobile" and "DevOps" categories are filterable (if category filtering exists) or displayed correctly.

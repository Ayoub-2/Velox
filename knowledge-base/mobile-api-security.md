---
title: 'Mobile API Security'
description: 'Securing communication between mobile apps and backends using Certificate Pinning and PKCE.'
date: '2026-02-02'
category: 'Mobile'
tags: ['mobile', 'android', 'ios', 'ssl-pinning', 'oauth']
---

# Mobile API Security

Mobile environments are uncontrolled. Attackers can decompile your app, inspect network traffic, and hook runtime methods. Securing the API channel is critical.

## 1. TLS Certificate Pinning

Standard HTTPS trusts any CA in the device's store. Attackers can install a user-certificate (MitM) to inspect traffic. Pinning forces the app to trust **only** your specific server certificate or public key.

### Android Implementation (OkHttp)
```java
String hostname = "api.velox.security";
CertificatePinner certificatePinner = new CertificatePinner.Builder()
    .add(hostname, "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build();

OkHttpClient client = new OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build();
```

### iOS Implementation (TrustKit)
```swift
let trustKitConfig = [
    kTSKSwizzleNetworkDelegates: false,
    kTSKPinnedDomains: [
        "api.velox.security": [
            kTSKPublicKeyHashes: [
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="
            ],
            kTSKEnforcePinning: true
        ]
    ]
]
TrustKit.initSharedInstance(withConfiguration:trustKitConfig)
```

## 2. API Key Protection

**Hard Truth**: You cannot hide secrets in a mobile app. Obfuscation only delays attacks.

*   **Do Not** embed AWS/Stripe secret keys in the app.
*   **Do** use an intermediate backend (BFF - Backend for Frontend) to sign requests.
*   **Do** use Google Play Integrity API / Apple App Attest to verify the request comes from a genuine app instance.

## 3. OAuth 2.0 with PKCE

Mobile apps are "Public Clients" (cannot keep secrets). The Authorization Code flow is vulnerable to interception. Use **PKCE (Proof Key for Code Exchange)**.

1.  App generates a random `code_verifier` and hashes it to create a `code_challenge`.
2.  App sends `code_challenge` with the authorization request.
3.  Back-end stores the challenge.
4.  After user logs in, Back-end returns an `authorization_code`.
5.  App sends `authorization_code` + `code_verifier` to token endpoint.
6.  Back-end validates `hash(code_verifier) == code_challenge`.

## 4. Tamper Detection

Detect if the app is running on a rooted/jailbroken device or under a debugger (Frida).

*   **Android**: RootBeer, Google Play Integrity.
*   **iOS**: IOSSecuritySuite.
*   **Response**: Do not crash immediately (attacker will trace it). Degrade functionality or flag the account silently.

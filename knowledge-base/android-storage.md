---
title: 'Android Secure Storage'
description: 'Best practices for storing sensitive data on Android: SharedPrefs, Keystore, and Database Encryption.'
date: '2026-02-02'
category: 'Mobile'
tags: ['android', 'storage', 'encryption', 'keystore']
---

# Android Secure Storage

Insecure data storage is a top mobile vulnerability. Never store sensitive tokens or PII in plain text.

## 1. EncryptedSharedPreferences

Replacing the insecure `SharedPreferences`, this Jetpack library automatically encrypts keys and values using the Android Keystore.

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val sharedPreferences = EncryptedSharedPreferences.create(
    context,
    "secret_shared_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

// Use like normal SharedPreferences
sharedPreferences.edit().putString("auth_token", token).apply()
```

## 2. Android Keystore System

Use the Keystore to store cryptographic keys. The keys are extracted from the application process and bound to the hardware (TEE/StrongBox) on supported devices.

```kotlin
val keyGenerator = KeyGenerator.getInstance(
    KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore"
)
keyGenerator.init(
    KeyGenParameterSpec.Builder(
        "MyKeyAlias",
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
    .build()
)
val key = keyGenerator.generateKey()
```

## 3. Database Encryption (SQLCipher)

SQLite databases are just files. Anyone with root access can pull and read them. Use **SQLCipher** (or Room with SQLCipher support) to encrypt the entire database page-by-page.

```kotlin
val factory = SupportFactory(SQLiteDatabase.getBytes("my-secret-passphrase".toCharArray()))
val db = Room.databaseBuilder(context, MyDatabase::class.java, "secure.db")
    .openHelperFactory(factory)
    .build()
```

## 4. What NOT to do
*   **External Storage**: Never store sensitive files on SD card/External storage (globally readable/writable).
*   **Hardcoded Keys**: Never use hardcoded AES keys to encrypt data. Decompilers will find them instantly.

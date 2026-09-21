---
"@adobe/alloy-core": patch
---

Fixed `edgeCredentials.clientSecret` being exposed in plaintext — via `getLibraryInfo()`'s result, the browser/Node console when `debugEnabled`/`setDebug` is on, and any registered `monitors` (e.g. `onInstanceConfigured`, `onBeforeCommand`). `clientSecret` is now replaced with `"[REDACTED]"` wherever a config/options object carrying `edgeCredentials` is logged, notified to a monitor, or returned from `getLibraryInfo()` — a real risk for customer implementations that naively log or inspect that data. Only `edgeCredentials.clientSecret` itself is touched; everything else, including functions like `onBeforeEventSend`, is left as the exact same reference.

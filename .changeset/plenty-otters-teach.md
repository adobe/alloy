---
"@adobe/alloy-core": patch
---

Fixed `edgeCredentials.clientSecret` being logged in plaintext — both to the browser/Node console when `debugEnabled`/`setDebug` is on, and to any registered `monitors` (e.g. `onInstanceConfigured`, `onBeforeCommand`). `configure()`'s options and the computed instance config are now redacted (any key matching `/secret|password/i`, e.g. `clientSecret`, becomes `"[REDACTED]"`) before they're logged or handed to a monitor callback — a real risk for customer implementations that naively log `data.config`/`data.options` from a monitor. Only `configure()`'s own options/config are redacted; other commands' options (e.g. `sendEvent`'s XDM payload) are left untouched, since those carry arbitrary customer data that could coincidentally use a similar field name.

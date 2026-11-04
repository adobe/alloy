---
"@adobe/alloy": patch
"@adobe/alloy-core": patch
"@adobe/alloy-node": patch
---

Use the platform-provided SDK version consistently in XDM implementation details, library info, rules, and media metadata. This fixes npm installations reporting the literal `__VERSION__` placeholder without changing package entry points.

Platform services expose the optional version as `libraryVersion`. Library info continues to accept the legacy `libraryVersionOverride` field for compatibility with existing Node SDK releases.

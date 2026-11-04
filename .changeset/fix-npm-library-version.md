---
"@adobe/alloy": patch
"@adobe/alloy-core": patch
---

Use the platform-provided SDK version consistently in XDM implementation details, library info, rules, and media metadata. This fixes npm installations reporting the literal `__VERSION__` placeholder without changing package entry points.

---
"@adobe/alloy-core": patch
"@adobe/alloy": patch
"@adobe/alloy-node": patch
"reactor-extension-alloy": patch
---

Eliminate the legacy `__VERSION__` build-time placeholder across all packages by reading package versions directly from `package.json`, ensuring `@adobe/alloy-core`, `@adobe/alloy`, `@adobe/alloy-node`, and the Tags extension always report real semver versions.

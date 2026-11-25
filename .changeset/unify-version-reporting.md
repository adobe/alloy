---
"@adobe/alloy-core": patch
"@adobe/alloy": patch
"@adobe/alloy-node": patch
"reactor-extension-alloy": patch
---

Eliminate the legacy `__VERSION__` build-time placeholder across all packages and emit static version modules into published `dist/` output. `@adobe/alloy-core`, `@adobe/alloy`, `@adobe/alloy-node`, and the Tags extension always report real semver versions, and downstream bundlers such as Rollup no longer require `@rollup/plugin-json` to consume `@adobe/alloy` or `@adobe/alloy-core`.

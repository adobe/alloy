---
"@adobe/alloy": minor
---

`@adobe/alloy` now publishes compiled JavaScript and generated type declarations in a flat `dist/` folder, and every export has `alloy-source`, `types` and `default` conditions. Deep type paths moved from `dist/types/browser/src/*.d.ts` to `dist/*.d.ts`. Import from the public entry points (`@adobe/alloy`, `@adobe/alloy/baseCode.js`, `@adobe/alloy/standalone.js`, `@adobe/alloy/serviceWorker.js`) instead of deep type paths. The legacy `libEs6` aliases now resolve to compiled `dist` output. Runtime behavior is unchanged.

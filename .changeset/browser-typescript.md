---
"@adobe/alloy": minor
---

`@adobe/alloy` is now written in TypeScript. Runtime behavior is unchanged. Packaging changes:

- The `.`, `./baseCode.js`, `./standalone.js` and `./serviceWorker.js` entries now resolve to compiled JavaScript in `dist/` instead of the raw `src/` files. The package still ships `src/`, so custom builds keep working.
- Type declarations moved from `dist/types/browser/src/...` to sit next to the compiled files in `dist/` (for example `dist/index.d.ts`). Imports through the package entries pick them up automatically. Code that referenced the old `dist/types/...` paths directly must switch to the package entries.

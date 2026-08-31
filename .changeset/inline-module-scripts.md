---
"@adobe/alloy": patch
---

Execute inline ES module scripts (`<script type="module">`) found in Personalization offers as modules. Inline modules are now re-created in the document head (like remote scripts) so the browser runs them with module semantics, instead of being executed as classic scripts — which broke module-only syntax such as `import`/`export`.

When re-creating a script in the document head to force execution, the Web SDK now copies only the attributes needed to execute it correctly — `type`, `src`, `nonce`, `crossorigin`, `integrity`, `referrerpolicy`, `fetchpriority`, and `nomodule` — rather than all author attributes. This prevents the re-created script from creating duplicate `id`/`class` matches (for `document.getElementById`/`querySelector`) with the original, inert offer script element, while still executing with the same fetch/CORS/SRI semantics as the original. The page's current CSP nonce, when found, takes priority over any nonce written into the source markup. Re-created classic inline scripts now also preserve `nomodule`, so an author's module-browser fallback script is still skipped as intended.

Scripts whose `type` isn't recognized as executable (absent/empty, a JavaScript MIME type, or `"module"`) — e.g. `importmap`, `application/json`, or a templating library's custom type — are no longer extracted or re-created at all. These were never executed by the browser regardless of insertion method, so they're left untouched in place instead of being forced through the inline/remote script pipeline.

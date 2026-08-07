---
"@adobe/alloy": patch
---

Execute inline ES module scripts (`<script type="module">`) found in Personalization offers as modules. Inline modules are now re-created in the document head (like remote scripts) so the browser runs them with module semantics, instead of being executed as classic scripts — which broke module-only syntax such as `import`/`export`.

When re-creating a script in the document head to force execution, the Web SDK now copies only the `type`, `src`, and `nonce` attributes rather than all author attributes. This prevents the re-created script from creating duplicate `id`/`class` matches (for `document.getElementById`/`querySelector`) with the original, inert offer script element. Classic inline script handling is unchanged.

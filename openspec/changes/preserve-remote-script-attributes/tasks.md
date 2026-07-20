## 1. Update remote-script extraction and execution

- [ ] 1.1 In `scripts.js`, replace `getRemoteScriptsUrls` with `getRemoteScripts(fragment)` that returns the original remote `<script>` elements (filtered by `isRemoteScript`) instead of their `src` URLs.
- [ ] 1.2 Update `loadScript` to accept a source script element, create a fresh `<script>`, copy all attributes from the source via `element.attributes` + `setAttribute`, then override invariants last: apply `nonce` when present and set `script.async = true`.
- [ ] 1.3 Update `executeRemoteScripts` to accept the array of source script elements and pass each to `loadScript`; keep returning `Promise.all` of the load promises.
- [ ] 1.4 Preserve the existing `getPromise` `onload`/`onerror` behavior by assigning the handlers after attributes are copied, so a copied inline `onload`/`onerror` attribute cannot break load tracking.

## 2. Update DOM action callers

- [ ] 2.1 Update `appendHtml.js` to import/call `getRemoteScripts` and pass elements to `executeRemoteScripts`.
- [ ] 2.2 Apply the same change in `prependHtml.js`.
- [ ] 2.3 Apply the same change in `insertHtmlBefore.js`.
- [ ] 2.4 Apply the same change in `insertHtmlAfter.js`.
- [ ] 2.5 Confirm `remapHeadOffers.js` needs no change (it delegates to `appendHtml`) and the head-remap path preserves attributes.

## 3. Tests

- [ ] 3.1 Add/adjust unit tests for `scripts.js`: a remote script with `class`, `type`, and `data-*` attributes yields a head script element carrying all of them plus enforced `async`.
- [ ] 3.2 Add a test that `async` is enforced even when the source omits or differs on it, and that `nonce` is applied when available.
- [ ] 3.3 Add a test that the returned promise resolves on load and rejects on error, and that a copied inline `onload`/`onerror` attribute does not prevent resolution.
- [ ] 3.4 Update tests for the four `*Html.js` actions (and any that assert on `getRemoteScriptsUrls`) to reflect the new element-based API and attribute preservation.

## 4. Verify

- [ ] 4.1 Run the Personalization dom-actions test suite and full lint; ensure no references to the removed `getRemoteScriptsUrls` remain.
- [ ] 4.2 Manually verify against the PDCL-14174 repro shape: an offer script `<script class="mfx-targetOffer" src="..." type="text/javascript">` produces a head script retaining `class` and `type`.

## 1. Classify inline modules as head scripts

- [x] 1.1 In `scripts.js`, add an `isModule` helper and split classification: `isInlineScript` covers classic srcless scripts only (excludes `type="module"`); add `isInlineModuleScript` (srcless, `type="module"`, has code); `isHeadScript` = remote OR inline module.
- [x] 1.2 Point `getInlineScripts` at classic inline scripts (original `textContent` + `nonce` body) and `getRemoteScripts` at `isHeadScript`, so inline modules flow through the head path.

## 2. Narrow re-created head-script attributes and execute inline modules

- [x] 2.1 Update `loadScript` to copy only `type`, `src`, and `nonce` onto the re-created head script (no longer all author attributes).
- [x] 2.2 Handle a source with no `src` (inline module): copy `type` + `nonce`, carry `textContent`, append to `document.head`, and resolve immediately (inline modules emit no load event).
- [x] 2.3 Keep the remote (`src`) branch: set `src`, force `async`, attach the `onload`/`onerror` promise.

## 3. Tests

- [x] 3.1 Add a test that an inline module is returned by `getRemoteScripts` and excluded from `getInlineScripts`, while a classic inline script stays on the inline path.
- [x] 3.2 Add a test that an inline module with no code is ignored by both paths.
- [x] 3.3 Add a test that executing an inline module injects a `type="module"` script into `document.head`, resolves without waiting, executes with ES module semantics (module-only `export` runs), and does NOT carry author `class`/`data-*`.
- [x] 3.4 Update the remote-script test to assert only `type`/`src`/`nonce` are copied and `class`/`id`/`data-*` are not.
- [x] 3.5 Keep classic inline behavior covered (executes and is removed from the DOM).

## 4. Verify

- [x] 4.1 Run the Personalization dom-actions test suite and lint the changed files.
- [x] 4.2 Confirm the four `*Html.js` callers need no change.

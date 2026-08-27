## Why

`preserve-remote-script-attributes` (PDCL-14174 / PR #1557) copied **all** author attributes onto **remote** `<script src>` elements executed from Personalization offers, which — as a side effect of retaining `type` — enabled remote ES module offer scripts to run as modules. Two gaps remain:

1. **Inline modules don't run as modules.** `getInlineScripts` re-creates each inline `<script>` with only its `textContent` and the CSP `nonce`, then appends/removes it synchronously — a model that assumes classic execution and drops `type`. So an inline `<script type="module">…</script>` runs as a **classic** script and its module-only `import`/`export` syntax throws a `SyntaxError`.
2. **Copying all attributes duplicates identity.** The original offer `<script>` is left in the page (inert — scripts inserted via `innerHTML` never run). Copying its `id`/`class`/`data-*` onto the executed head element creates a second element with the same identity, so `document.getElementById`/`querySelector` now match (and return) the head element instead of the original.

This addresses the Vanguard ES module request in PDCL-14354.

## What Changes

- Classify an inline `<script type="module">` as a **head script** (executed asynchronously in `document.head`) rather than a classic inline script, so it runs as a real ES module against the document base URL (relative `import`s resolve).
- **Copy only `type`, `src`, and `nonce`** onto any script re-created in `document.head`, instead of all author attributes. `id`, `class`, and `data-*` are no longer duplicated onto the executed element, eliminating the duplicate-identity lookups introduced by #1557.
- Continue forcing `async` on remote scripts and tracking their load; leave classic inline script handling unchanged.

## Non-Goals

- Load-completion tracking for inline modules — inline module scripts emit no `load` event, so the head element for an inline module resolves immediately (fire-and-forget). Remote script load tracking (used for pre-hiding removal) is unchanged.
- Preserving arbitrary author attributes on the executed script. This is a deliberate reduction from #1557; the required functional attributes (`type`, `src`, `nonce`) are retained.
- Any change to public configuration or the command surface.

## Capabilities

### Modified Capabilities
- `personalization-script-execution`: extends the capability (added by `preserve-remote-script-attributes`) to cover inline ES module execution and to narrow the attributes copied onto re-created scripts.

## Impact

- Code: `packages/browser/src/components/Personalization/dom-actions/scripts.js` (script classification + `loadScript`). No changes needed in the four `*Html.js` callers.
- Behavior: Inline `type="module"` offer scripts now run as ES modules. Re-created head scripts carry only `type`/`src`/`nonce`; author `id`/`class`/`data-*` are no longer copied onto them (a change from #1557). Classic inline scripts are unchanged.
- Tests: Unit tests under `packages/browser/test/unit/specs/components/Personalization/dom-actions/scripts.spec.js`.
- No changes to public configuration or the command surface.

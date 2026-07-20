## Why

When a Personalization offer (e.g. a Target HTML offer or experience fragment) contains a remote `<script src="...">`, the Web SDK does not execute the script node inserted via the offer HTML. Instead it re-creates a fresh `<script>` element to force the browser to load and run it, appending that element to `document.head`. Today only `src` (and `async`) are set on the re-created element, so every other author-supplied attribute (`class`, `type`, `data-*`, `crossorigin`, `integrity`, etc.) is stripped. Customers who rely on those attributes for downstream logic see broken behavior (reported in PDCL-14174 by Vanguard, where a `class` attribute on the script is required and is lost).

## What Changes

- Preserve all author-supplied attributes when the Web SDK re-creates remote `<script>` elements from Personalization offer HTML, rather than only `src`/`async`.
- Change the internal remote-script pipeline to carry the original script elements (or their attribute sets) through to execution instead of collapsing them to bare URLs.
- Continue to force `async` and honor the CSP `nonce` on the re-created element so load-completion tracking and pre-hiding removal keep working.
- Apply the fix uniformly across all DOM insertion actions that execute remote scripts (`appendHtml`, `prependHtml`, `insertHtmlBefore`, `insertHtmlAfter`), including the head-remap path.

## Capabilities

### New Capabilities
- `personalization-script-execution`: How the Web SDK extracts and executes inline and remote `<script>` elements found in Personalization offer HTML, and which attributes are preserved on re-created remote script elements.

### Modified Capabilities
<!-- None: there is no existing spec capturing this behavior. -->

## Impact

- Code: `packages/browser/src/components/Personalization/dom-actions/scripts.js` (remote-script extraction and execution) and the four `*Html.js` DOM action callers that pass remote scripts through it.
- Behavior: Remote scripts re-created in `document.head` will now carry all their original attributes. This is a behavioral change visible in the DOM but not a public API change.
- Tests: Unit tests under `packages/browser/src/components/Personalization/dom-actions/` for `scripts.js` and the affected HTML actions.
- No changes to public configuration or the command surface.

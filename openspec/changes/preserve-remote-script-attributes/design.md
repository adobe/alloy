## Context

Personalization offer HTML (Target HTML offers and experience fragments) is inserted into the page via the DOM actions in `packages/browser/src/components/Personalization/dom-actions/`. Scripts inserted through `innerHTML`/document fragments are not executed by the browser, so the Web SDK extracts scripts from the offer fragment and re-runs them explicitly:

- `getInlineScripts(fragment)` / `executeInlineScripts` handle inline scripts (already re-create nodes with a `nonce`).
- `getRemoteScriptsUrls(fragment)` collects `src` URLs, and `executeRemoteScripts(urls)` calls `loadScript(url)`, which does:

```js
const script = document.createElement("script");
script.src = url;
script.async = true;
document.head.appendChild(script);
```

Because only `src` and `async` are set, all other author attributes are dropped. PDCL-14174 reports Vanguard losing a required `class` attribute on the executed script. The async re-creation and `onload`/`onerror` promise are intentional: load completion is what allows the pre-hiding snippet to be removed at the right time. So the fix must keep async + load tracking while additionally copying attributes.

Callers involved: `appendHtml.js`, `prependHtml.js`, `insertHtmlBefore.js`, `insertHtmlAfter.js` all call `getRemoteScriptsUrls` then `executeRemoteScripts`. `remapHeadOffers.js` rewrites head-targeted offers into `appendHtml`, so it inherits the same path.

## Goals / Non-Goals

**Goals:**
- Preserve every author-supplied attribute of a remote offer `<script>` on the element that is actually executed in `document.head`.
- Keep forcing `async` and keep the `onload`/`onerror` load-completion promise used for pre-hiding removal.
- Keep applying the CSP `nonce` when present.
- Apply uniformly across all four HTML insertion actions and the head-remap path.

**Non-Goals:**
- Changing inline-script handling (already re-creates nodes; unchanged beyond consistency).
- Executing the original in-fragment script node directly (browsers won't run it, and moving it loses the async/load-tracking guarantees).
- Adding an allow/deny list of attributes — the request is to preserve author intent faithfully.
- Any change to public configuration or command surface.

## Decisions

### Carry script elements (not URLs) through the pipeline

Replace `getRemoteScriptsUrls` (returns `string[]`) with a function that returns the original remote script **elements** (e.g. `getRemoteScripts(fragment)` → `Element[]`), and change `executeRemoteScripts` to accept elements. `loadScript` builds the new element from the source element's attributes.

Rationale: The attribute set lives on the DOM element; passing bare URLs throws that information away at the earliest step. Passing elements keeps the change localized to `scripts.js` plus a one-line rename in each caller.

Alternative considered: keep returning URLs but also return a parallel array of attribute maps. Rejected — two parallel arrays are error-prone versus one array of elements.

### Build the executed element by copying attributes, then overriding

In `loadScript`, create a fresh `<script>`, copy all attributes from the source element (iterating `element.attributes`), then explicitly set the invariants last so they cannot be clobbered:

```js
const script = document.createElement("script");
for (const { name, value } of source.attributes) {
  script.setAttribute(name, value);
}
if (nonce) script.setAttribute("nonce", nonce);
script.async = true;           // enforce async regardless of source
const promise = getPromise(src, script);
document.head.appendChild(script);
```

Rationale: copy-then-override guarantees `async` and `nonce` win even if the source set them differently, while every other attribute (`class`, `type`, `data-*`, `crossorigin`, `integrity`, …) is preserved. This reuses the existing `createNode` primitive shape (`setAttribute` per attribute) so it stays consistent with `getInlineScripts`, which already threads `nonce` via a `createNode` attributes object.

Alternative considered: `cloneNode(true)` of the source. Rejected — a cloned script that was created via `innerHTML` is still flagged non-executable by the browser, so it would not run; an element built with `document.createElement` is required.

### Keep `async` as a property, `nonce`/others as attributes

`script.async = true` (property) matches today's behavior and the HTML spec; author attributes are applied via `setAttribute`. This preserves the existing observable behavior for load ordering.

## Risks / Trade-offs

- [An offer author sets `onload`/`onerror` inline handler attributes that could interfere with our load-tracking] → We set our `onload`/`onerror` via the `getPromise` assignment after copying attributes; assigning the properties overrides any copied inline-handler attribute, so load tracking still resolves. Verify with a test.
- [Copying arbitrary attributes could carry an author-set `nonce` that conflicts with the page CSP] → We override `nonce` last when one is available; when none is available we preserve the author value, matching prior leniency.
- [Behavioral change is observable in the DOM and could surprise integrations that depended on the stripped form] → This is the intended fix; documented in the proposal and covered by tests. No public API changes.

## Migration Plan

No data or config migration. Ship as a normal library change; the new behavior takes effect once the offer is re-rendered. Rollback is a straightforward revert of `scripts.js` and the caller renames.

## Open Questions

- None. The internal helper rename (`getRemoteScriptsUrls` → `getRemoteScripts`) is not part of the public API, so no deprecation path is needed.

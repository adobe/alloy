## Context

Personalization offer HTML is inserted via the DOM actions in `packages/browser/src/components/Personalization/dom-actions/`. Scripts inserted through `innerHTML`/document fragments are not executed by the browser, so the Web SDK extracts scripts and re-runs them explicitly. The offer's original `<script>` elements remain in the inserted content (inert). Two execution paths exist:

- **Head scripts** — `getRemoteScripts(fragment)` collects `<script src>` elements; `executeRemoteScripts` calls `loadScript`, which re-creates each as a fresh element in `document.head` and returns an `onload`/`onerror` promise so pre-hiding removal can wait for the load. `preserve-remote-script-attributes` (#1557) made `loadScript` copy **all** author attributes.
- **Inline scripts** — `getInlineScripts(fragment)` re-creates each srcless `<script>` with `textContent` + `nonce`; `executeInlineScripts` appends it to the offer container and immediately removes it (synchronous classic execution).

An inline `<script type="module">` goes down the inline path today, losing `type` and running as a classic script — module-only syntax throws. Separately, copying all attributes in `loadScript` means the executed head element now shares `id`/`class` with the inert original, changing `getElementById`/`querySelector` results.

## Goals / Non-Goals

**Goals:**
- Run inline `type="module"` offer scripts as ES modules, preserving the document base URL so relative `import`s resolve.
- Copy only the attributes required to execute correctly (`type`, `src`, `nonce`) onto re-created head scripts, so they don't duplicate the original offer script's identity.
- Leave classic inline script handling unchanged.

**Non-Goals:**
- Load-completion tracking for inline modules (not achievable without breaking imports — see below).
- Preserving author `id`/`class`/`data-*` on the executed script; this is a deliberate reduction from #1557.

## Decisions

### Route inline modules to the head-script path

Inline modules execute asynchronously, like remote scripts, and unlike synchronous classic inline scripts. So classify them with the head scripts:

```js
const isModule = (element) => getAttribute(element, TYPE) === MODULE;
const isRemoteScript = (element) => is(element, SCRIPT) && !!getAttribute(element, SRC);
const isInlineModuleScript = (element) =>
  is(element, SCRIPT) && !getAttribute(element, SRC) && isModule(element) && !!element.textContent;
const isInlineScript = (element) =>
  is(element, SCRIPT) && !getAttribute(element, SRC) && !isModule(element);
const isHeadScript = (element) => isRemoteScript(element) || isInlineModuleScript(element);
```

`getInlineScripts` filters on `isInlineScript` (now classic-only), keeping its original body; `getRemoteScripts` filters on `isHeadScript`, so it also returns inline module source elements.

### Copy only `type`, `src`, and `nonce` in `loadScript`

```js
const type = getAttribute(source, TYPE);
if (type) script.setAttribute(TYPE, type);
const nonce = getNonce();
if (nonce) script.setAttribute("nonce", nonce);

if (!url) {                    // inline module: carry the code, fire-and-forget
  script.textContent = source.textContent;
  document.head.appendChild(script);
  return Promise.resolve(script);
}
script.src = url;             // remote: force async + track load
script.async = true;
const promise = getPromise(url, script);
document.head.appendChild(script);
return promise;
```

`type` is required so a module runs as a module; `src` is the source; `nonce` (from the page) is required under CSP. Author `id`/`class`/`data-*` are intentionally omitted: the inert original offer script retains them, so `document.getElementById`/`querySelector` continue to resolve to it rather than to two competing elements. This reverses the duplicate-identity behavior introduced by #1557 while keeping the functional attributes that offer scripts actually need to execute.

### Re-create the inline module in `<head>` with its code

Appending an inline `<script type="module">` (with code, no `src`) to `<head>` executes it as a module against the **document** base URL, so relative `import`s keep working. `<head>` is a stable mount point independent of the offer container's lifecycle.

### Why no load tracking for inline modules

Verified empirically in Chromium via the browser test harness: an inline `<script type="module">` **executes** but fires **no `load` event** (a 2s wait for `onload` times out), whereas an external/remote module script *does* fire `load`. So there is no completion signal for an inline module; the head element resolves immediately. Synthesizing one by converting the code to a `blob:`/`data:` URL would change the module's base URL and break relative `import` resolution, so it is rejected. This is not a regression: `executeInlineScripts` never returned a promise, so inline scripts were never awaited, and remote-script load tracking is unchanged.

## Risks / Trade-offs

- [Reducing copied attributes changes released behavior] → Offers relying on `id`/`class`/`data-*` being present on the *executed* head element (from #1557) will no longer find them there; the attributes remain on the inert original. Called out in the changeset and PR.
- [An inline module's logic has not necessarily run when render resolves] → Inherent to modules being asynchronous; unavoidable without a completion signal inline modules do not provide.

## Migration Plan

No data or config migration. Ships as a normal library change; new behavior takes effect once the offer is re-rendered. Rollback is a straightforward revert of `scripts.js`.

## Open Questions

- None.

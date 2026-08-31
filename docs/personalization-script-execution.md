# How the Web SDK executes `<script>` elements in personalization offers

> **Note for the documentation team**
> This is source material for the Web SDK personalization docs
> (Experience League: *Data Collection → Web SDK → Personalization*). It describes how
> `<script>` elements contained in Personalization offer HTML are executed when the
> offer is applied through a DOM action.

## Background

Adobe Target offers (HTML offers, experience fragments, and custom-code offers) and other
personalization actions can contain markup that includes `<script>` elements. The Web SDK
applies this markup to the page using a **DOM action** — for example, replacing an element's
HTML or appending HTML to a container.

Browsers **do not execute** `<script>` elements that are inserted through `innerHTML` or a
document fragment. To make the offer's scripts run, the Web SDK extracts each eligible
`<script>` from the offer markup and **re-creates it as a fresh element** that the browser
will execute. How it is re-created depends on the type of script.

## Which DOM actions execute scripts

Only actions that insert **HTML** extract and execute `<script>` elements. These are:

| Action (offer type) | Executes scripts? |
| --- | --- |
| `setHtml` | Yes |
| `replaceHtml` | Yes |
| `appendHtml` | Yes |
| `prependHtml` | Yes |
| `insertBefore` / `insertAfter` | Yes |
| Custom code offer | Yes |
| Offer targeted at the page `<head>` | Yes |
| `setText`, `setAttribute`, `setStyle`, `setImageSource`, `move`, `resize`, `rearrange`, `remove` | No |

A `<script>` that appears inside a non-HTML action (for example, as text passed to `setText`)
is treated as inert content and is never executed.

## Which `<script>` elements are eligible for execution

Not every `<script>` tag is something the browser would ever run. Per the HTML specification, a
`<script>` element only executes if its `type` attribute is:

- absent or empty,
- a recognized JavaScript MIME type (for example `text/javascript`, `application/javascript`), or
- `module`.

Any other `type` — for example `importmap`, `application/json`, or a custom type used by a
templating library (`text/x-template`) — marks the element as a **data block**. Browsers never
execute data blocks, regardless of how they were inserted into the page (a normal HTML parse,
`innerHTML`, or `appendChild`).

The Web SDK honors this distinction: only elements the browser would actually execute (classic
JavaScript or an ES module) are extracted and re-created. A data-block `<script>` is left exactly
where the offer placed it — untouched, inert, and readable via `textContent` by any code that
expects it (for example, a templating library reading its own `<script type="text/x-template">`
blocks).

## Script types and how each is executed

Scripts that pass the eligibility check above are classified and handled one of three ways.

### 1. Inline (classic) scripts

An inline script has **no `src` attribute** and is **not** an ES module (no `type="module"`) —
its code is written directly between the tags:

```html
<script>
  console.log("hello from the offer");
</script>
```

Handling:

- Re-created and run **synchronously**, in document order, inside the offer's target element.
- The re-created element is **removed from the DOM immediately** after it runs (the code has
  already executed; the element is not left behind).
- The Web SDK applies the page's Content Security Policy `nonce`, if one is present (see
  [CSP](#content-security-policy-nonce)).
- A `nomodule` attribute on the original script **is** carried onto the re-created element. This
  matters because the Web SDK forces the script to run via `appendChild` — without preserving
  `nomodule`, a script the author intended as a module-browser fallback (meant to be skipped by
  browsers that support ES modules) would run when it shouldn't.
- Other author attributes (`class`, `id`, `data-*`) are **not** carried onto the element,
  because the element is removed right after execution and is never observable.
- Classic-script semantics apply: top-level `var` and `function` declarations become global
  (properties of `window`).

### 2. Remote scripts (`src`)

A remote script references an external file with `src`:

```html
<script src="https://example.com/widget.js" class="mfx-offer" data-region="us"></script>
```

Handling:

- Re-created as a fresh `<script>` element that is appended to `document.head`.
- Only the attributes needed to execute/fetch the script correctly are carried over: **`type`,
  `src`, `nonce`, `crossorigin`, `integrity`, `referrerpolicy`, `fetchpriority`, and `nomodule`**.
  These are exactly the attributes that change *how the browser runs the request or the script* —
  CORS mode, subresource-integrity validation, the referrer sent, load scheduling priority, and
  the module-browser skip. Author identity/presentation attributes such as `id`, `class`, and
  `data-*` are **not** copied onto the executed element (they remain on the original offer
  script — see [Finding the script element](#finding-the-script-element)).
- `async` is enforced, so the script loads asynchronously and does not block page rendering.
  Load order between multiple remote scripts is therefore **not guaranteed**.
- The page's CSP `nonce` is applied if one is found, and it **overrides** any `nonce` the author
  placed on the offer script. If the page has no detectable CSP nonce, the author's own `nonce`
  (if present) is carried over as a fallback.
- The Web SDK tracks load completion (`load` / `error`) for each remote script. This completion
  signal is what allows the personalization **pre-hiding** style to be removed at the right time.

### 3. Inline ES module scripts — `<script type="module">`

An inline module has **no `src`** but declares `type="module"`, with the module code written
inline:

```html
<script type="module">
  import { init } from "https://example.com/lib.js";
  init();
</script>
```

Handling:

- Because module scripts execute **asynchronously**, an inline module is treated like a remote
  script rather than a classic inline script: it is re-created in `document.head`.
- The re-created element carries the same attribute set as a remote script (`type="module"`,
  `nonce`, `crossorigin`, `integrity`, `referrerpolicy`, `fetchpriority`, `nomodule`) plus the
  module code as its text content. As with remote scripts, other author attributes (`id`, `class`,
  `data-*`) are **not** copied onto the executed element.
- `crossorigin` matters here even though the inline script itself is never fetched: it affects the
  fetch options used when the browser resolves the module's own `import` statements.
- The browser evaluates it as a **true ES module**. The module's base URL is the **document's**
  base URL, so **relative `import`s resolve against the page** as expected.
- Load completion is **not** tracked for inline modules (see the note under
  [Load completion](#load-completion-and-pre-hiding)).

### Summary

| Script in the offer | Re-created where | Attributes carried over | Execution | Completion tracked |
| --- | --- | --- | --- | --- |
| Inline classic (`<script>…</script>`) | Offer container, then removed | `nonce`, `nomodule` | Synchronous | N/A (synchronous) |
| Remote (`<script src>`) | `document.head` | `type`, `src`, `nonce`, `crossorigin`, `integrity`, `referrerpolicy`, `fetchpriority`, `nomodule` | Async | Yes |
| Inline module (`<script type="module">`) | `document.head` | `type`, `nonce`, `crossorigin`, `integrity`, `referrerpolicy`, `fetchpriority`, `nomodule`, + code | Async (module) | No |
| Remote module (`<script type="module" src>`) | `document.head` | Same as remote, above | Async (module) | Yes |
| Data block (e.g. `type="importmap"`, `type="application/json"`, custom type) | Not touched — left in place | N/A | Never (inert) | N/A |

## Finding the script element

When the Web SDK re-creates a script to execute it, the **original** `<script>` from the offer
stays in the page where the offer was inserted — it just never runs (browsers do not execute
scripts inserted via `innerHTML`). That inert original keeps all of its author attributes
(`id`, `class`, `data-*`).

The executed copy in `document.head` deliberately does not carry `id`, `class`, or `data-*`. So a
lookup such as `document.getElementById("myScript")` or `document.querySelector(".my-offer")`
resolves to the **original** offer element, not the executing head copy. If your code needs to
reference the script, target the original by its `id`/`class`; for a script that needs to find
*itself* while running, use `document.currentScript` (note: `document.currentScript` is `null`
inside an ES module).

## Content Security Policy (nonce)

If a CSP `nonce` is present on the page, the Web SDK applies that `nonce` to every re-created
script (classic inline, remote, and module) so the browser permits it to execute under the
policy. For remote and module scripts, the page's `nonce` **overrides** any `nonce` the author
placed on the offer script; if the page has no detectable nonce, the author's `nonce` (if any) is
used as a fallback. For classic inline scripts, the page's `nonce` is applied when present; there
is no fallback to an author-supplied `nonce` on inline scripts.

## Load completion and pre-hiding

The Web SDK waits for **remote** scripts (including remote modules) to finish loading before it
removes the personalization pre-hiding style, so content that a remote script produces is not
revealed prematurely.

Inline scripts do not participate in this:

- Inline **classic** scripts run synchronously, so they are already finished when rendering
  continues.
- Inline **module** scripts run asynchronously but emit **no `load` event** (a browser
  limitation for inline modules — only *fetched* scripts fire `load`). The Web SDK therefore
  cannot wait for an inline module to finish; it runs on a best-effort, "fire-and-forget" basis.
  If an offer must gate the pre-hiding reveal on script completion, use a **remote** script.

## ES module behavior authors should know

When an offer script runs as an ES module (inline or remote), module semantics apply:

- **Module scope is isolated.** Top-level `const`, `let`, and `function` declarations are private
  to the module and are **not** added to `window`. To expose something globally, assign it
  explicitly (for example, `window.myThing = …`).
- **`document.currentScript` is `null`** during module evaluation. A module cannot locate its own
  `<script>` element the way a classic inline script can.
- **Relative imports** resolve against the document base URL.
- **Remote modules are evaluated once per URL.** If the same remote module (`type="module"` with
  the same `src`) is injected more than once, the browser's module map evaluates it a single time.

## Import maps and other data-block scripts

A `<script type="importmap">` is a data block, not code — the browser reads it to resolve
subsequent module specifiers rather than executing it. The Web SDK does not extract or move
import-map scripts; they are left exactly where the offer placed them, inert. Because import maps
must be registered before any module script parses in order to affect its resolution, an import
map delivered inside a personalization offer generally cannot be relied on to influence how that
same offer's own module scripts resolve their imports — deliver any needed import map as part of
the page's own markup instead.

The same "leave it alone" handling applies to any other `<script>` whose `type` is not a
recognized JavaScript MIME type or `module` (for example, JSON data blocks or templating-library
placeholder scripts): the Web SDK does not touch these at all.

## Re-rendering and repeated execution

Some personalization actions re-apply on every render (for example, custom-code offers, and SPA
view changes that re-render an offer). Each time an offer is applied, its scripts are **re-created
and executed again**. This is expected behavior.

Consequences to be aware of:

- **Multiple script elements** may accumulate in `document.head`. If the offer script carries an
  `id`, this produces duplicate IDs in the DOM. Browsers tolerate this; `document.getElementById`
  returns the first match.
- **Re-execution** occurs for classic scripts and **inline** modules on each render. (A remote
  module with a stable `src` is the exception — it is evaluated only once, as noted above.)

### Detecting a repeated run from within a module

Because a module's top-level scope is fresh on every execution, a top-level variable cannot record
"I have run before." Use a store that outlives a single execution:

- **A `window` global** — the simplest idempotency guard:

  ```js
  if (window.__offerXInitialized) {
    // subsequent run
  } else {
    window.__offerXInitialized = true;
    // first-time setup
  }
  ```

- **An imported singleton module** — module-idiomatic; the imported module is URL-keyed and
  evaluated once, so its exported state persists across re-executions:

  ```js
  import registry from "https://example.com/offer-registry.js";
  if (!registry.has("offerX")) {
    registry.add("offerX");
    // first-time setup
  }
  ```

- **Counting the injected tags** — the re-created script is left in `document.head` with its
  attributes preserved, so author code can count occurrences of a distinguishing attribute:

  ```js
  if (document.querySelectorAll('script[data-offer="offerX"]').length > 1) {
    // this render is a repeat
  }
  ```

## Author checklist

- To force execution and preserve attributes, deliver scripts as **remote** (`src`) where
  possible — this is the most predictable path and supports load-completion gating.
- For ES modules, prefer a **remote** module (`type="module" src="…"`) when you need
  guaranteed single evaluation and load tracking; use an **inline** module when the code must be
  inlined and you accept best-effort (untracked, re-executing) behavior.
- Do not rely on `document.currentScript` inside a module.
- If your script must run only once across re-renders, add an explicit idempotency guard
  (see above).
- Remember that inline classic scripts run synchronously and inline/remote scripts that touch the
  DOM should target elements by selector or ID, not by their own position.
- Don't rely on an `importmap` (or any other data-block script) delivered inside an offer to
  affect how that same offer resolves its own module imports — such scripts are left inert and
  untouched by the Web SDK.

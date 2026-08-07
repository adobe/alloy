## ADDED Requirements

### Requirement: Inline module scripts execute as ES modules

When Personalization offer HTML contains an inline `<script type="module">` (no `src`, with code), the Web SDK SHALL execute it as an ES module. It SHALL re-create the script in `document.head` carrying the `type="module"` attribute and the original code, so the browser evaluates it as a module against the document base URL (relative `import`s resolve).

#### Scenario: Inline module runs as a module

- **WHEN** an offer contains `<script type="module">…module-only syntax…</script>`
- **THEN** a `type="module"` script with the same code is appended to `document.head` and the browser evaluates it as an ES module (module-only `import`/`export` syntax does not throw a SyntaxError)

#### Scenario: Inline module without code is ignored

- **WHEN** an offer contains `<script type="module"></script>` with no code
- **THEN** no script is executed for it

### Requirement: Inline modules are handled on the head-script path, not the inline path

An inline `<script type="module">` SHALL be treated as a head script (re-created in `document.head`), not a classic inline script (appended to and removed from the offer container). Classic inline scripts SHALL continue to be executed synchronously in the container and removed.

#### Scenario: Classic and module inline scripts are routed differently

- **WHEN** an offer contains both `<script type="module">…</script>` and a classic inline `<script>…</script>`
- **THEN** the classic inline script is executed synchronously in the offer container and removed, and the module script is re-created and executed in `document.head`

### Requirement: Only functional attributes are copied to re-created head scripts

When the Web SDK re-creates a script in `document.head` to force execution (a remote script or an inline module), it SHALL copy only the `type`, `src`, and CSP `nonce` attributes. It SHALL NOT copy other author attributes such as `id`, `class`, or `data-*`, so that the executed element does not duplicate the identity of the original (inert) offer script for `document.getElementById`/`querySelector`.

#### Scenario: Identity attributes are not copied

- **WHEN** an offer contains `<script id="x" class="y" data-z="1" type="text/javascript" src="/a.js"></script>`
- **THEN** the script appended to `document.head` has `type="text/javascript"` and `src="/a.js"`, but no `id`, `class`, or `data-z`

#### Scenario: CSP nonce is applied

- **WHEN** a nonce is available at render time
- **THEN** the re-created head script element has the `nonce` attribute set to that value

### Requirement: Async loading and load tracking are retained for remote scripts

Re-created remote (`src`) scripts SHALL be loaded asynchronously and SHALL expose a load-completion signal so pre-hiding removal continues to work. Because inline module scripts emit no load event, the Web SDK SHALL NOT block on inline module completion; the load promise for an inline module SHALL resolve immediately.

#### Scenario: Remote script tracking is retained

- **WHEN** a remote `<script src>` offer script is executed
- **THEN** its promise resolves on load and rejects on error, and `async` is enforced

#### Scenario: Inline module resolves without waiting

- **WHEN** an inline module offer script is executed
- **THEN** the returned promise resolves without waiting for the module to finish evaluating

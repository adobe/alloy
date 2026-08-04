## ADDED Requirements

### Requirement: Remote script attributes are preserved on execution

When the Web SDK executes a remote `<script src="...">` found in Personalization offer HTML, it re-creates a new script element and appends it to `document.head` so the browser loads and runs it. The re-created element SHALL carry every author-supplied attribute present on the original offer script element, not only `src`.

#### Scenario: Author attributes are copied to the executed script

- **WHEN** an offer contains `<script class="mfx-targetOffer" src="/x.js" type="text/javascript"></script>`
- **THEN** the script element appended to `document.head` has `src="/x.js"`, `class="mfx-targetOffer"`, and `type="text/javascript"`

#### Scenario: Multiple and data attributes are preserved

- **WHEN** an offer script declares `data-*`, `crossorigin`, or `integrity` attributes
- **THEN** those same attributes and values are present on the re-created head script element

### Requirement: Async loading and load tracking are retained

The re-created remote script element SHALL be loaded asynchronously and SHALL expose a load-completion signal so pre-hiding removal continues to work, regardless of the attributes present on the original offer script.

#### Scenario: async is enforced

- **WHEN** the original offer script omits `async`, or sets it to a different value
- **THEN** the re-created head script element loads asynchronously

#### Scenario: Load completion resolves

- **WHEN** the re-created remote script finishes loading
- **THEN** the promise returned for that script resolves, allowing pre-hiding cleanup to proceed
- **WHEN** the re-created remote script fails to load
- **THEN** the promise for that script rejects

### Requirement: CSP nonce is applied to re-created remote scripts

When a CSP `nonce` is available, the re-created remote script element SHALL include that `nonce` so it is permitted to execute under a Content Security Policy.

#### Scenario: nonce is set when present

- **WHEN** a nonce is available at render time
- **THEN** the re-created head script element has the `nonce` attribute set to that value

### Requirement: Attribute preservation applies to all remote-script insertion actions

Every Personalization DOM action that executes remote offer scripts — appending, prepending, and inserting HTML before or after a target, including the head-remap path — SHALL preserve the original script attributes identically.

#### Scenario: Consistent behavior across actions

- **WHEN** an offer containing an attributed remote script is applied via `appendHtml`, `prependHtml`, `insertHtmlBefore`, or `insertHtmlAfter`
- **THEN** the executed head script element retains all original author-supplied attributes in each case

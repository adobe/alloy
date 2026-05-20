## 1. Reactor API utilities

- [x] 1.1 Add a `fetchAllPages: true` option to `fetchDataElements` that pages through every variable-type DE on the property until `nextPage` is `null` (new code passes this option; existing call sites are unchanged)
- [x] 1.2 Add `buildDataElementIndex.js` under `packages/reactor-extension/src/view/utils/`: takes the array from 1.1 and returns `{ byId: Map<string, DataElement>, byName: Map<string, DataElement[]> }`
- [x] 1.3 Add `fetchExtensionActionRuleComponents.js` under `packages/reactor-extension/src/view/utils/`: pages `/properties/{propertyId}/rule_components`, filters client-side to delegate IDs prefixed `__EXTENSION_NAME__::actions::`, returns `{ results: [{ id, ruleId, ruleName, delegateDescriptorId, settings, name }], nextPage, totalCount }` (one page at a time, mirroring `fetchDataElements`); pulls rule names via JSON:API `include=rule`
- [x] 1.4 Add `makeReactorRequest.js` (generic request helper with `method`/`body` support), refactor `fetchFromReactor.js` to be a thin GET wrapper over it, and add `updateRuleComponent.js` that PATCHes `/rule_components/{id}` with new settings and surfaces a `UserReportableError` on failure
- [x] 1.5 Unit tests for 1.1–1.4 mirroring the pattern in `test/unit/view/utils/fetchDataElements.spec.js` and `fetchDataElementByName.spec.js`

## 2. Repair orchestration

- [x] 2.1 Add `repairStaleDataElementReferences.js` under `packages/reactor-extension/src/view/utils/`: orchestrates index-build → scan → classify → repair; accepts `{ orgId, imsAccess, propertyId, signal, onProgress }`; returns `{ scanned, repaired, skipped: [{ ruleComponentId, ruleName, actionName, reason, candidates? }], failed: [{ ruleComponentId, ruleName, actionName, error }], totalCount, cancelled }`
- [x] 2.2 Phase A — index build: call `fetchDataElements({..., fetchAllPages: true})` then `buildDataElementIndex`; emit a progress event `{ phase: "indexing" }` while in flight and `{ phase: "scanning", totalCount }` once the rule_components first page lands
- [x] 2.3 Phase B — scan loop: for each action page, iterate items serially; for each item, if `settings.dataElementId` is absent → silently skip (counted in `scanned` only); else if `byId.has(dataElementId)` → counted as scanned, not repaired; else look up `byName.get(dataElementName)`: missing name → skip-missing-name, zero matches → skip-no-name-match, more than one match → skip-ambiguous (include candidate IDs), exactly one match → PATCH via `updateRuleComponent`; emit a per-action progress event so the UI tally updates before the next action
- [x] 2.4 Honor the abort signal between actions: stop initiating new requests once aborted; AbortError from in-flight requests is captured as a clean `cancelled: true` outcome with the partial summary
- [x] 2.5 Unit tests for the orchestrator: valid → untouched, no-DE-ref → ignored, stale + unique-name → repaired, stale + no-name → skipped, stale + missing-name → skipped, stale + ambiguous → skipped, PATCH failure → failure isolated, multi-page → walked, abort mid-run → partial summary, AbortError mid-fetch → cancelled, empty property → 0/0/0/0, progress events → tally updates

## 3. Section UI and state machine

- [x] 3.1 Create `packages/reactor-extension/src/view/configuration/propertyConfigurationSection.jsx` exporting `PropertyConfigurationSection`. The section renders the body of a `<Disclosure id="propertyConfiguration">` (the disclosure wrapper itself lives in `configurationView.jsx`) with title "Property configuration", a short paragraph explaining the section's purpose, and (initially) the single "Repair stale data element references" button + helper text describing what the repair does
- [x] 3.2 Implement the section's state machine with the states: `idle`, `confirming`, `runningVisible`, `runningHidden`, `summaryVisible`, `summaryHidden` (after Close), keeping the operation result and live tally in section-level state so it persists across show/hide of the dialog
- [x] 3.3 Render the section's "runningHidden" state: `Repair in progress — Repaired N · Skipped N · Failed N` + `Show progress` button (transitions to `runningVisible`) + `Cancel` button (triggers abort signal)
- [x] 3.4 Render the section's `summaryHidden` state: `Last run: …` line summarizing the result + `Show details` button (transitions to `summaryVisible`) + `Run again` button (transitions to `confirming`); same panel for both completed and cancelled outcomes with appropriate wording
- [x] 3.5 Register the section in `configurationView.jsx`: added a new top-level `<Disclosure id="propertyConfiguration">` inside the existing `<Accordion>`, sibling to `buildOptions` and `instances`; defaults to collapsed; does not participate in form validation/submit (the repair is its own side-effecting action, not part of saving the extension config)
- [x] 3.6 The section manages its own `AbortController` via a `useRef`; unmounting calls `abort()` to cancel any in-flight repair. (Did not use `useAbortPreviousRequestsAndCreateSignal` because that helper aborts on every new signal, which conflicts with this section's "one signal per run" model.)

## 4. Operation dialog

- [x] 4.1 Co-located the operation dialog inside `propertyConfigurationSection.jsx` as `OperationDialog`. Renders a `DialogContainer` + `Dialog` with three internal states: `confirmation`, `running`, `summary`
- [x] 4.2 Confirmation state: heading + explanatory body + footer `Cancel` (closes, returns section to `idle`) / `Confirm` (starts orchestrator, transitions dialog to `running` and section to `runningVisible`); `isDismissable: true`
- [x] 4.3 Running state: heading + `ProgressCircle` + status line (`Loading data elements…` during indexing phase → `Scanned X of Y actions` during scan; if `Y` is unknown, indeterminate spinner + `Scanned X actions`) + live tally `Repaired N · Skipped N · Failed N` + footer `Hide` (closes dialog, section transitions to `runningHidden`, operation continues) / `Cancel` (triggers abort; dialog transitions to `summary` once orchestrator settles); `isDismissable: false` so Escape and click-outside are inert
- [x] 4.4 Summary state: heading + `InlineAlert` (positive if no skipped/failed, notice if skipped > 0 or cancelled, negative if failed > 0) + counts + collapsible `Skipped (n)` panel listing `<rule name> › <action name> — <reason>` (with candidate IDs for ambiguous matches) + collapsible `Failed (n)` panel listing `<rule name> › <action name> — <error message>` + footer `Close` / `Run again`; `isDismissable: true`
- [x] 4.5 The dialog is a pure view of the section's state machine: opening/closing the dialog mutates section state only, never the orchestrator; the orchestrator's progress events update the section state which in turn drives both the dialog and the hidden-state panel. Buttons are laid out via `<Flex>` inside `<Content>` (not React Spectrum's `ButtonGroup` slot) because ButtonGroup's ResizeObserver-based layout does not complete in isolated test renders — the Flex pattern works in both the app and the integration tests.

## 5. Tests

- [x] 5.1 Added `test/integration/configuration/propertyConfigurationSection.spec.jsx`: mocks Reactor API to return a property with a mix of valid actions, stale-with-unique-name (repaired), stale-with-no-name-match (skipped), stale-with-missing-name (skipped), and one stale action whose PATCH fails (failed). Drives the confirmation flow, asserts the final summary contents, and asserts that exactly the expected PATCHes were issued
- [x] 5.2 Added "Hide preserves operation" scenario: clicks Hide mid-run (with a gated rule_components fetch), asserts the section panel shows the running tally and the `Show progress` button reopens the dialog with the live tally; once unblocked, the run completes and the expected PATCH is observed
- [x] 5.3 Added "Cancel from section panel after Hide" scenario: hides the dialog, clicks Cancel in the section panel, asserts the section transitions to `summaryHidden` with a "Last run cancelled" line and zero PATCHes
- [x] 5.4 Added "Run again is idempotent" scenario: first run repairs 1 action; second run with the property state updated finds zero stale references and issues no additional PATCH
- [x] 5.5 Added "Modal cannot be dismissed while running" scenario: presses Escape during the running state, asserts the dialog stays open and the operation completes normally

## 6. Release

- [x] 6.1 Added a changeset describing the user-facing addition
- [ ] 6.2 Manually verify in a staging Reactor property: copy actions from a source property to a destination property, open extension config on destination, run repair, confirm action settings now point at destination-property data element IDs and that a second run reports zero stale references *(deferred — requires staging access)*

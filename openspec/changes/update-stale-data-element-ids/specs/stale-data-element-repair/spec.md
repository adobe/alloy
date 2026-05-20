## ADDED Requirements

### Requirement: Repair control in extension configuration view

The extension configuration view SHALL surface a property-scoped "Repair stale data element references" control. The control SHALL be visible to all users who can open the extension configuration view, and invoking it SHALL operate only on the property identified by `initInfo.propertySettings.id`.

#### Scenario: Control is rendered

- **WHEN** a user opens the extension configuration view for a property
- **THEN** the configuration view shows a top-level "Property configuration" disclosure section, sibling to "Build options" and "SDK instances", containing a "Repair stale data element references" button and a short description of what the operation does

#### Scenario: Control targets only the current property

- **WHEN** a user clicks the repair button while viewing property `P`
- **THEN** the operation scans and modifies rule_components belonging to property `P` only, using `propertyId`, `orgId`, and `imsAccess` from `initInfo`

### Requirement: Confirmation before mutation

The system SHALL prompt the user for confirmation in a dialog before performing any reads or writes. The confirmation dialog SHALL state, at minimum, that the operation will scan the property's actions and repair stale data element references, and SHALL offer "Confirm" and "Cancel" actions.

#### Scenario: User cancels confirmation

- **WHEN** the user clicks the repair button and then clicks "Cancel" in the confirmation dialog
- **THEN** no data elements or rule_components are fetched, no rule_components are modified, and the configuration view returns to its idle state

#### Scenario: User confirms

- **WHEN** the user clicks the repair button and then clicks "Confirm"
- **THEN** the scan and repair operation begins, the dialog transitions to its running state, and a progress indicator is shown

### Requirement: Modal semantics of the operation dialog

While the operation is running, the dialog SHALL be non-dismissable: it MUST NOT close on Escape, on click-outside, or via a close `X`. The running-state dialog SHALL instead expose two explicit footer actions: "Hide" (closes the dialog while the operation continues in the background) and "Cancel" (triggers an explicit abort of the operation). When the dialog is in its confirmation state or its summary state (after the operation completes or is cancelled), the dialog SHALL be freely dismissable.

#### Scenario: Escape and click-outside are inert while running

- **WHEN** the operation is in its running state and the user presses Escape or clicks outside the dialog
- **THEN** the dialog remains open and the operation is unaffected

#### Scenario: Hide preserves the running operation

- **WHEN** the user clicks "Hide" while the operation is running
- **THEN** the dialog closes, the operation continues, and the section panel shows a "Repair in progress" status with a "Show progress" button and a "Cancel" button

#### Scenario: Show progress re-opens the running dialog

- **WHEN** the section panel shows the "Show progress" button and the user clicks it
- **THEN** the operation dialog re-opens in its running state with the live tally and progress indicator

#### Scenario: Summary dialog is dismissable

- **WHEN** the operation has completed or been cancelled and the dialog is in its summary state
- **THEN** the user can close the dialog via Escape, click-outside, or the close `X`

### Requirement: Scope of scan

The repair operation SHALL examine every rule_component on the current property whose `delegate_descriptor_id` identifies it as an action belonging to this extension. The operation SHALL NOT examine rule_components that are events, conditions, or that belong to other extensions, and SHALL NOT examine data elements themselves.

#### Scenario: Non-extension components are ignored

- **WHEN** the property contains rule_components from other extensions
- **THEN** the operation does not read or modify those components

#### Scenario: Non-action components are ignored

- **WHEN** the property contains event or condition rule_components belonging to this extension
- **THEN** the operation does not read or modify those components

### Requirement: Property-scoped data element index

Before scanning rule_components, the operation SHALL fetch every variable-type data element on the current property and build an in-memory index keyed by `dataElementId` (for membership tests) and by `dataElementName` (for repair lookup). The index SHALL be built once per invocation; the operation SHALL NOT reuse an index from a prior invocation.

#### Scenario: Index built before scan begins

- **WHEN** the user confirms the operation
- **THEN** the operation first fetches all variable-type data elements on the property and builds the index, before reading any rule_components

#### Scenario: Index is per-invocation

- **WHEN** the user invokes the operation, then later invokes it again
- **THEN** the second invocation fetches the property's data elements again and rebuilds the index, picking up any data elements added or removed between runs

### Requirement: Detection of stale references

For each in-scope action, the operation SHALL parse the action's stored `settings` and, if a `dataElementId` is present, SHALL classify the reference as "stale" if and only if that `dataElementId` is not present in the property-scoped index built for the current invocation. Actions whose settings do not contain a `dataElementId` SHALL be skipped without classification.

#### Scenario: Valid reference is left untouched

- **WHEN** an action's `dataElementId` resolves to a data element that exists on the current property
- **THEN** the action is counted as scanned but not modified

#### Scenario: Stale reference is detected

- **WHEN** an action's `dataElementId` cannot be resolved to a data element on the current property
- **THEN** the operation classifies the action as having a stale reference and proceeds to attempt repair

#### Scenario: Action without a data element ID is skipped

- **WHEN** an action's settings do not include a `dataElementId`
- **THEN** the operation does not attempt to resolve or repair that action

### Requirement: Repair by exact name match with name-resolution fallbacks

For each action classified as stale, the operation SHALL match on data element name using exact, case-sensitive equality against the property-scoped name index. The operation SHALL NOT normalize casing, trim whitespace, or perform fuzzy matching. Repair SHALL be performed only when exactly one such match exists.

The "name to match" is resolved through this fallback chain so that actions saved before the action settings began persisting `dataElementName` (#1503), as well as actions whose saved name is out of date because the source DE was renamed after the action was last saved, are still recoverable:

1. **Primary:** the action's stored `settings.dataElementName`.
2. **Fallback when no name is saved:** fetch the data element by its stored `dataElementId` from the global, non-property-scoped endpoint (`/data_elements/{id}` — Reactor IDs are global, so a stale ID still resolves on the source property as long as that DE has not been deleted there). Use the returned `name` as the match key.
3. **Fallback when the saved name has zero local matches:** repeat step 2 to learn the source DE's current name (in case it was renamed after the action was saved) and retry the local match with that name.

The global lookup SHALL be cached per invocation, keyed by stale `dataElementId`, so multiple actions sharing the same stale ID trigger at most one lookup per run.

When the unique-match path produces a repair, the PATCH SHALL set both `settings.dataElementId` to the matching DE's id and `settings.dataElementName` to the matching DE's name. Writing `dataElementName` makes the action self-recoverable for future stale-ID scenarios (the primary path will succeed without needing a lookup).

#### Scenario: Unique name match via saved name — repair

- **WHEN** the action's saved `dataElementName` matches exactly one variable-type data element `D` on the current property
- **THEN** the operation PATCHes the action's rule_component setting `dataElementId` to `D.id` and `dataElementName` to `D.name`

#### Scenario: Recovery via global lookup when no name is saved — repair on match

- **WHEN** the action has no saved `dataElementName`, the global lookup for the stale `dataElementId` returns a name, and that name matches exactly one data element `D` on the current property
- **THEN** the operation PATCHes the action's rule_component setting `dataElementId` to `D.id` and `dataElementName` to `D.name`

#### Scenario: Fresh-name fallback when saved name is stale — repair on match

- **WHEN** the action's saved `dataElementName` matches no data element on the current property, and the global lookup for the stale `dataElementId` returns a *different* name that matches exactly one data element `D` on the current property
- **THEN** the operation PATCHes the action's rule_component setting `dataElementId` to `D.id` and `dataElementName` to `D.name`

#### Scenario: No name match after both attempts — skip and report

- **WHEN** neither the saved name nor (if attempted) the looked-up name matches any data element on the current property
- **THEN** the operation leaves the action unchanged and records a skip with reason "no name match" and the most-recently-tried name in the result summary

#### Scenario: No name resolvable at all — skip and report

- **WHEN** the action has no saved `dataElementName` AND the global lookup for the stale `dataElementId` fails (e.g. the source DE has been deleted) OR returns an empty name
- **THEN** the operation leaves the action unchanged and records a skip with reason "missing name" in the result summary

#### Scenario: Ambiguous name match — skip and report (no retry)

- **WHEN** the name being matched (saved or looked-up) matches more than one data element on the current property
- **THEN** the operation leaves the action unchanged and records the reason "ambiguous name match" together with the candidate IDs in the result summary; the operation SHALL NOT retry via the global lookup, because matches-greater-than-one indicates the name is meaningful on this property and the user must disambiguate manually

#### Scenario: Lookup cache deduplicates per stale ID

- **WHEN** multiple actions in the same run reference the same stale `dataElementId` and trigger the global lookup
- **THEN** the operation invokes `/data_elements/{id}` at most once for that ID, reusing the cached name (or cached failure) for subsequent actions

### Requirement: Per-action failure isolation

A failure while processing one action SHALL NOT prevent the operation from processing remaining actions. Each failure SHALL be captured and surfaced in the final summary.

#### Scenario: PATCH fails for one action

- **WHEN** the PATCH request to repair action `A` fails (e.g. network error, 403)
- **THEN** the operation records the failure for `A` and continues processing the remaining actions

### Requirement: Idempotent operation

Re-invoking the repair operation immediately after a successful run SHALL produce no further writes for actions that were repaired in the prior run, because their references now resolve on the current property.

#### Scenario: Second run after full repair

- **WHEN** the user invokes the repair operation a second time with no intervening property changes after a run that repaired some actions
- **THEN** the second run reports zero stale references for the previously-repaired actions

### Requirement: Cancellation is distinct from hiding the dialog

The user SHALL be able to cancel an in-progress repair operation via an explicit "Cancel" action exposed both in the running-state dialog and in the section panel (while the dialog is hidden). Hiding the dialog SHALL NOT cancel the operation. On cancellation, the operation SHALL stop initiating new requests; writes already in flight SHALL be allowed to complete or fail naturally; the dialog SHALL transition to its summary state reflecting the partial outcome.

#### Scenario: User cancels from the running dialog

- **WHEN** the user clicks "Cancel" in the running-state dialog
- **THEN** no new rule_components are read or modified after cancellation, and the dialog transitions to a summary state displaying a partial summary of work completed before the cancel signal

#### Scenario: User cancels from the section panel after hiding

- **WHEN** the user clicks "Hide" while the operation is running and then clicks "Cancel" in the section panel
- **THEN** the operation aborts as if the user had clicked "Cancel" in the dialog, and the section panel updates to its "Last run cancelled" state

#### Scenario: Hide alone does not cancel

- **WHEN** the user clicks "Hide" while the operation is running and does not click "Cancel" afterward
- **THEN** the operation continues to scan and PATCH rule_components until it completes

### Requirement: Live running tally

While the operation is running, the system SHALL surface incremental progress as a live tally of scanned, repaired, skipped, and failed counts. The tally SHALL be visible in the section panel at all times during the run, regardless of whether the dialog is currently open, and SHALL also be visible in the running-state dialog when that dialog is open. The user-facing controls (Show progress, Cancel) in the section panel SHALL be rendered only while the dialog is hidden, because those controls duplicate dialog footer actions and are redundant when the dialog is open.

#### Scenario: Tally updates during run

- **WHEN** the operation processes additional actions during a run
- **THEN** the scanned/repaired/skipped/failed counts shown in both the section panel and the dialog (when visible) reflect each newly processed action before the next action is processed

#### Scenario: Section panel tally remains visible while dialog is open

- **WHEN** the dialog is open during the running state
- **THEN** the section panel continues to display the live tally text behind/alongside the dialog; only the redundant Show-progress and Cancel controls are hidden

### Requirement: Result summary

When the operation completes (successfully, by failure, or by cancellation), the system SHALL display a summary including: total actions scanned, repaired actions (with per-action detail), skipped actions (with per-action reasons), and failed actions (with per-action errors). The summary SHALL identify each repaired, skipped, or failed action by a stable, user-visible identifier (action name and containing rule name) so the user can locate it manually. The summary SHALL be reachable both immediately after the run (in the dialog's summary state) and afterward (via a "Show details" button in the section panel) until the user re-runs the operation or navigates away. A short "Last run: …" summary line SHALL also be visible in the section panel itself after the run, regardless of whether the dialog is open or closed.

#### Scenario: Summary shown after run

- **WHEN** the repair operation finishes and the dialog is in its summary state
- **THEN** the dialog shows the counts and a per-action list of any repaired, skipped, or failed actions, each with its rule name and action name

#### Scenario: Repaired actions list per-action detail

- **WHEN** the run completes and one or more actions were repaired
- **THEN** the dialog's summary shows a "Repaired (N)" group with one entry per repaired action, each entry including: the containing rule name, the action name, the matched data element name, the previous (stale) `dataElementId`, and the new `dataElementId`

#### Scenario: Last-run line stays in the section panel

- **WHEN** the operation has completed and the dialog is either open or closed
- **THEN** the section panel shows a single-line "Last run: …" summary describing the outcome at all times until the next run is started

#### Scenario: Summary reopened from section panel

- **WHEN** the user closes the summary dialog and then clicks "Show details" in the section panel
- **THEN** the dialog re-opens in its summary state with the same contents

### Requirement: Run again

After a completed or cancelled run, the user SHALL be able to start a new run from either the dialog's summary state or the section panel via a "Run again" affordance. Starting a new run SHALL return the operation to its confirmation state.

#### Scenario: Run again from section panel

- **WHEN** the user clicks "Run again" in the section panel after a completed run
- **THEN** the operation dialog re-opens in its confirmation state, and no scan or PATCH occurs until the user confirms

### Requirement: No persistence of operation history

The system SHALL NOT persist a history of repair operations or their results. Each invocation's summary SHALL be ephemeral, visible only until the user re-runs the operation or navigates away from the configuration view.

#### Scenario: Navigating away clears prior summary

- **WHEN** the user closes the extension configuration view after a repair run and re-opens it later
- **THEN** the prior summary is no longer shown

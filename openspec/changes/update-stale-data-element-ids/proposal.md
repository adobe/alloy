## Why

When users copy or import actions from another property, the data element IDs embedded in those action settings keep pointing at the source property and become "stale" — the referenced data element does not exist on the destination property. Today the extension fixes these references one action at a time, only on next open and save of each action view (see `updateVariableView.jsx`). For a property with many affected actions this is tedious and easy to miss. Users want a single button that repairs every stale reference across the entire property in one operation.

## What Changes

- Add a property-wide "Repair stale data element references" control to a new top-level "Property actions" section of the extension configuration view. The extension configuration view is the only top-level surface the extension owns relative to a property's rules and actions, so it is the natural home for the action; the "Property actions" section groups future property-scoped utilities alongside it.
- On invocation, the operation fetches every variable-type data element on the property once and indexes them by name and by ID, then pages through every action rule_component in the property that belongs to this extension and uses the index to detect stale `dataElementId` references.
- For each stale reference, attempt repair by looking up the action's stored `dataElementName` (the name persisted alongside the ID at save time) in the index. If exactly one variable-type data element on the destination property matches, rewrite the action's stored `dataElementId` to that match and PATCH the rule_component back to Reactor.
- Show progress to the user in a dialog (confirmation → running → summary) modeled on the long-running operations in AEP. The running state is intentionally non-dismissable; "Hide" minimizes the dialog while the operation continues, and the section panel surfaces a status line plus a "Show progress" button to reopen it. "Cancel" is an explicit, separate action.
- Report a final summary to the user: number of actions scanned, number repaired, number that could not be repaired (no name match on the property, missing name, ambiguous name), and any errors. Stale references that cannot be repaired are left untouched so the user can address them manually.

## Capabilities

### New Capabilities
- `stale-data-element-repair`: A property-scoped operation, surfaced from the extension configuration view, that scans this extension's actions for stale data element ID references and repairs them by matching on data element name.

### Modified Capabilities
<!-- None. This change adds a new capability; it does not alter the spec-level behavior of any existing capability. -->

## Impact

- **UI**: New top-level "Property actions" disclosure section and operation dialog in `packages/reactor-extension/src/view/configuration/` (new `propertyActionsSection.jsx`, wired into `configurationView.jsx` as a sibling of the existing "Build options" and "SDK instances" sections).
- **Utilities**: New helpers under `packages/reactor-extension/src/view/utils/` to (a) page through every variable-type data element on a property and return a name-indexed `Map`, (b) page through this extension's action rule_components for a property, and (c) PATCH a rule_component's settings back to Reactor. Existing `fetchDataElements` is reused (and extended to fetch all pages when needed); `fetchDataElement` / `fetchDataElementByName` are unchanged.
- **APIs (Reactor)**: Read from `/properties/{propertyId}/data_elements` (paged, filtered to this extension's variable delegate_descriptor_id); read from `/properties/{propertyId}/rule_components` (paged, filtered to this extension's action delegate_descriptor_ids); PATCH `/rule_components/{id}` to persist repaired settings.
- **Tests**: New unit tests for the utilities and integration tests for the configuration view section, mirroring the structure of the existing `updateVariable` integration tests.
- **No breaking changes**: The repair is opt-in (button click) and skips any action whose ID still resolves on the property or whose stored name has no unique property-scoped match.

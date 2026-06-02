## Context

This extension's actions (e.g. `updateVariable`) persist references to data elements as a pair of fields in the action settings: a `dataElementId` (the canonical pointer used at runtime) and, for newer saves, a `dataElementName` recorded alongside the ID. When users copy a rule/action from one property to another — either through the Reactor copy flow or through manual settings export/import — the `dataElementId` is preserved verbatim and points at a data element on the *source* property that does not exist on the *destination* property. At runtime, this manifests as a broken action; in the extension UI, the data element field appears empty until the user re-selects.

A recent fix (#1503, `fetchDataElementByName`) addresses this *per-action, on next save* by resolving the saved `dataElementName` against the destination property's data elements when the action's view is opened. That fix is correct but only repairs an action when a user opens it. Properties with many copied actions still need a bulk-repair path.

Constraints:
- The extension UI is hosted inside Adobe Experience Platform Tags (Reactor). Each "view" (extension configuration, each action) is a separate iframe whose host provides `initInfo` with the property ID, IMS access token, org ID, etc. The extension configuration view is the only top-level surface available to us; we cannot add a top-level toolbar inside the Reactor UI.
- All Reactor mutations are PATCHes against `rule_components`; there is no batch endpoint. Each repair is a separate authenticated HTTP request.
- The property may contain many rule_components; we must page through results and be polite about request volume.
- Users can navigate away mid-operation. The extension view is iframed and we cannot block the host, but we can disable in-view controls and show progress.

## Goals / Non-Goals

**Goals:**
- A single button in the extension configuration view that, when invoked, scans every action rule_component on the current property that belongs to this extension, identifies stale `dataElementId` references, and repairs them in place by matching on `dataElementName`.
- Clear, conservative behavior: never overwrite a valid reference; never guess when the name has no unique match on the destination property; never silently mutate data.
- A final summary the user can act on: scanned count, repaired count, skipped/unresolved count, and per-action failure detail for anything that errored.
- Reuse the existing `fetchDataElements`/`fetchDataElementByName`/`fetchDataElement` helpers so this change does not fork DE-resolution logic.

**Non-Goals:**
- Repairing data element references *inside* other data elements (only action rule_components are in scope; data elements that reference other data elements via `%name%` strings are name-keyed already and are not affected by the stale-ID problem).
- Repairing references in conditions or events. The current stale-ID bug only manifests in action settings that store a raw `dataElementId`; conditions/events reference DEs by `%name%` in code paths.
- Cross-property migration tooling (copying rules between properties). This change repairs the aftermath of copies, it does not perform them.
- Automatic repair on extension config load. The user explicitly invokes the operation so that mutations are intentional.
- Surfacing repair history. Each invocation reports its own results; we do not persist a log.

## Decisions

### Decision: Host the control in the extension configuration view, as its own top-level "Property actions" section

The extension configuration view is already the top-level surface for property-scoped extension settings. We add a new top-level `<Disclosure>` inside the existing `<Accordion>` in `configurationView.jsx`, as a sibling of "Build options" and "SDK instances". The new section is titled **"Property actions"** — a clear label for property-scoped operations like the repair. The repair button inside it stays specific: **"Repair stale data element references"**. The section defaults to collapsed since most users will not need it.

**Alternatives considered:**
- *A new standalone view registered with Reactor.* Reactor extensions can register additional views, but they must be wired into the host's rule-builder UI surfaces (action/condition/event), not into a property-level "tools" area. There is no extension hook for property-level utility views. Rejected.
- *A nested section inside "SDK instances".* The repair operates on the whole property, not per-instance, so nesting it under "SDK instances" would be misleading. Rejected.
- *Trigger from each action view individually.* That's what #1503 already does, on-save. The point of this change is to fix many actions at once.
- *Section name "Property configuration" / "Data element maintenance" / "Property maintenance" / "Property tools".* "Maintenance" reads slightly negative; "configuration" implies settings rather than operations. "Property actions" was chosen as it best describes the section's purpose.

### Decision: Scan via `/properties/{propertyId}/rules` paginated, then per-rule `/rules/{ruleId}/rule_components` in parallel

The proposal originally assumed Reactor exposes `GET /properties/{propertyId}/rule_components` for listing all rule_components on a property. Testing against the real API showed it does not: that path returns **405 Method Not Allowed** (the URL is reserved for other verbs but not list reads). A second attempt using `GET /properties/{propertyId}/rules?include=rule_components` (JSON:API include) is accepted by Reactor but the `included` array always comes back empty — Reactor does not honor that include on the rules collection.

The canonical Reactor pattern is to page through `/properties/{propertyId}/rules` for the rule list, then call `/rules/{ruleId}/rule_components` for each rule. We parallelize the per-rule fetches within a single rules page via `Promise.all`, so each "page" produces one rules call plus up to `page[size]` per-rule calls executed concurrently over the HTTP/2 connection. The orchestrator drives outer pagination as before; nothing about its iteration shape changes.

**Alternatives considered:**
- *`GET /properties/{propertyId}/rule_components`.* The proposal's first approach. Returns 405 in practice. Rejected.
- *`GET /properties/{propertyId}/rules?include=rule_components`.* Single round-trip per page in theory; Reactor returns an empty `included` array in practice. Rejected.
- *Fetch every rule_component and filter client-side.* No endpoint exists that lists components without a parent rule scope. N/A.

**Trade-offs:** Per-rule fanout is wasteful for rules that have no extension actions (we still issue a fetch). For a property with many rules and few extension actions this is the worst case. Acceptable for now; if performance becomes an issue we can pre-filter via the rules' own attributes (e.g. only fetch components for rules whose `extension` relationship indicates our extension) once we confirm that data is available on the rules resource.

**Reactor list endpoint `totalCount` semantics:** because pagination iterates rules, the helper returns `totalCount` as the property's **rules** count, not actions. The running UI labels this explicitly ("Scanned X actions across Y rules") to avoid implying X-of-Y are commensurate units.

### Decision: Build a property-DE index once at the start of the operation; use it for both staleness detection and name matching

When the user confirms the repair, the first step is to page through every variable-type data element on the property via `fetchDataElements` (with `minResults: Infinity`, or equivalently a paging loop that consumes every page). The result is materialized as two indices built from the same array:

- `byId: Map<dataElementId, dataElement>` — used to decide whether an action's stored `dataElementId` is stale (`!byId.has(id)` → stale).
- `byName: Map<name, dataElement[]>` — used to look up repair candidates by the action's stored `dataElementName`. A name maps to an array because duplicate names are possible; the repair path requires `array.length === 1`.

Both indices are local to a single invocation; there is no caching across runs.

**Alternatives considered:**
- *Per-action `fetchDataElement` calls to test staleness.* Simpler, but generates one round-trip per action and runs into a correctness wrinkle: `fetchDataElement` by ID resolves cross-property because Reactor IDs are global, so a "found" response does not by itself prove the DE belongs to the current property. The index approach avoids both the request volume and the ambiguity. Rejected.
- *Per-action `fetchDataElementByName` calls for matching.* Same network cost concern; redundant once we already have the full set of property-scoped DEs in memory. Rejected.
- *Cache the property-DE index across button presses.* The user's mental model is "I just copied things — repair now"; a stale cache could mask DEs added between presses. Skipped for simplicity; revisit only if scan latency becomes a complaint.

Memory cost is bounded: a property with thousands of variable DEs at ~1 KB each is on the order of single-digit MB inside the iframe — well within budget.

### Decision: Match candidates to a destination DE by exact `dataElementName`, with a global-ID-lookup fallback for missing or stale saved names

For each stale action, the name used to search `byName` is resolved through a small fallback chain:

1. **Primary:** the action's stored `settings.dataElementName`. This is what #1503 persists on each save, and what we expect to find for the common "copied yesterday, repair today" workflow.
2. **Fallback (no saved name):** call `fetchDataElement({ dataElementId })`, which hits `/data_elements/{id}` — a global, non-property-scoped endpoint. Reactor IDs are global, so even a stale ID still resolves on the source property as long as the source DE has not been deleted. Use the returned `name` as the match key. This covers actions saved before #1503.
3. **Fallback (saved name has zero local matches):** call `fetchDataElement` again to learn the source DE's *current* name (which differs from the saved name when the DE was renamed on the source property after the action was saved but before the property was copied). Retry the local match with the looked-up name.

Both fallbacks consult and populate a per-invocation `Map<staleId, name | null>` cache, so multiple actions referencing the same stale ID trigger at most one `/data_elements/{id}` call per run. Null cache entries (lookup failure) are also cached to avoid retrying a known-bad ID.

Matching itself is exact and case-sensitive at every step. The ambiguous case (>1 local matches) is *not* retried via the lookup, because matches-greater-than-one indicates the name is already meaningful on the destination — looking up the source DE's ID won't help the user disambiguate between two destination DEs they already have.

**Why "look up by stale ID" works here:** Reactor's `/data_elements/{id}` endpoint does not enforce a property scope. We rely on this exact behavior elsewhere (`updateVariableView.jsx` since #1503). The risk is that the source DE could be deleted on its source property; the lookup then returns 404 and falls through to a `MISSING_NAME` skip.

**Alternatives considered:**
- *Fuzzy match by name.* Risk of mis-binding to a similarly-named DE that has different semantics. Rejected — repair must be conservative.
- *Case-insensitive match.* The copy flow preserves casing exactly. Introducing case insensitivity creates a new mis-bind vector with no observed benefit. Rejected.
- *Match by `settings.solutions` or schema id when name is missing.* The schema/solutions metadata of variable DEs is configuration, not identity; multiple DEs could share it. Rejected for now; if telemetry shows many actions are saved without a `dataElementName`, we can revisit.
- *Skip when no saved name (original design).* This was the proposal's behavior. Local testing immediately surfaced the case: any action saved before #1503 would be unrecoverable, even though Reactor still holds the source DE's name globally. The global-lookup fallback closes that gap at the cost of one extra request per unique stale ID per run.
- *Skip when saved name has no match (original design).* This was the proposal's behavior. Local testing on a property whose DEs had been renamed showed those actions becoming permanently broken after a copy — the saved name no longer matched anything anywhere. The second fallback closes that gap at the cost of one cached extra request.

### Decision: Repair by PATCHing the rule_component's settings; write both `dataElementId` and `dataElementName`

For each successful match, build a new settings object with `dataElementId` replaced by the matched DE's id *and* `dataElementName` set to the matched DE's name, then PATCH `/rule_components/{id}` with the new `settings` (stringified). No other fields on the rule_component are touched.

The PATCH writes `dataElementName` unconditionally — even if the original settings were missing it (older save) or carried an outdated value. This makes the action self-recoverable for future stale-ID scenarios: next time the action's ID goes stale (e.g. another property copy), the orchestrator's primary name-resolution path succeeds without needing the global-lookup fallback. We are not preserving the user's exact prior wording because either (a) there was no prior `dataElementName`, or (b) the prior `dataElementName` did not match any DE on this property and the user has not surfaced an intent to keep it.

**HTTP wrinkle:** the PATCH is the extension's first write to Reactor. Reactor's API uses JSON:API media types: `Accept: application/vnd.api+json;revision=1` carries Reactor's revision selector, but **the `Content-Type` header for request bodies must be the bare `application/vnd.api+json`** (no parameters). Sending the parameterized form on Content-Type returns 415 Unsupported Media Type. We send the two headers with different values accordingly.

**Alternatives considered:**
- *Use the rule_component's containing rule revision endpoint.* Heavier API surface with revision semantics; unnecessary for a settings update.
- *Preserve the original `dataElementName` exactly.* Less coupling, but defeats the self-recovery benefit and re-introduces the renames-aren't-tracked failure mode that the fresh-name fallback above is designed to solve once. Rejected.

### Decision: Surface progress through a dismissable operation dialog backed by a section-level status indicator

The repair runs are typically short but can span minutes for very large properties; AEP teaches users that long-running, mutating operations live in their own dialog (schemas, datastreams). We adopt that pattern with one tightening: the dialog is intentionally hard to dismiss *while running*, to prevent accidental loss of the progress UI.

**Modal semantics by state:**
- *Confirmation:* `isDismissable: true`. Standard confirm/cancel.
- *Running:* `isDismissable: false`, no close `X`, Escape and click-outside inert. Footer offers an explicit `Hide` (closes the dialog, operation continues; section panel shows status + "Show progress" button) and `Cancel` (negative variant, triggers abort signal). This avoids the accessibility pitfall of fully trapping focus while still preventing the "I clicked away and lost my repair" failure mode.
- *Summary (complete or cancelled):* `isDismissable: true`. Footer offers `Close` (returns dialog to unmounted state; section panel shows "Last run: …" + "Show details" + "Run again") and `Run again` (returns the dialog to Confirmation).

**Section panel states** (the section panel's status text stays visible at all times — the dialog overlays it rather than replacing it):

| State | Section panel contents |
| --- | --- |
| Idle (first time) | Helper text + `Repair stale data element references` button |
| Running, dialog visible | `Repair in progress — Repaired N · Skipped N · Failed N` (status text only — controls live in the dialog) |
| Running, dialog hidden | `Repair in progress — Repaired N · Skipped N · Failed N` + `Show progress` (primary) + `Cancel` (secondary, mirrors the dialog's Cancel) |
| Complete or Cancelled, dialog visible | `Last run: …` summary line (status text only — controls live in the dialog) |
| Complete or Cancelled, dialog hidden | `Last run: …` summary line + `Show details` (re-opens dialog in Summary state) + `Run again` |

The status text persists regardless of dialog visibility; only the redundant controls collapse when the dialog is open.

The dialog and the section panel share a single state machine — the dialog is a *view* of the running operation, not its owner.

**Execution model:**
1. On Confirm: build the property-DE index, then start iterating action rule_components page-by-page.
2. Per page, classify and repair each in-scope action; emit incremental updates (`scanned++`, `repaired++`, `skipped++` with reason, `failed++` with error) that drive the live tally in both the dialog and the section panel.
3. PATCHes run serially within the loop (no parallel writes). The "scanned of total" denominator uses the first `rule_components` page's `meta.pagination.total_count` when available; if not, the UI falls back to an indeterminate spinner with a running count.

**Alternatives considered:**
- *Inline progress in the section panel only (no dialog).* Simpler to implement; less recognizable to AEP users who expect long-op dialogs; harder to draw attention to non-trivial mutations. Rejected.
- *Fully focus-trapping modal during run.* Bad practice for screen reader users; also prevents the user from copy-pasting an error message out of the section while the run is going. Rejected in favor of the `Hide`-button approach.
- *Auto-run on config load.* Too aggressive; mutates data without intent. Rejected.
- *Parallelize PATCHes.* Risk of rate-limiting on Reactor; serial keeps the implementation simple and the UX predictable. We can add concurrency-controlled batching as a follow-up.

### Decision: Operate per-extension scope, on the *current* property only

The button uses the `propertyId`, `orgId`, and `imsAccess` provided by `initInfo`. It does not attempt to discover or operate on other properties.

## Risks / Trade-offs

- **Risk:** A user runs the repair, then immediately re-runs and is surprised that nothing changes. **Mitigation:** Result panel persists the previous run's summary and the second run reports "0 stale references found"; description text in the section explains idempotency.
- **Risk:** A property has thousands of rule_components and the scan times out or runs long. **Mitigation:** The up-front DE index makes per-action staleness detection O(1) (no per-action round-trip); only confirmed-stale, unique-match actions trigger a PATCH. The operation runs serially with the dialog/section progress UI and can be cancelled via the standard extension-view abort signal pattern (`useAbortPreviousRequestsAndCreateSignal`).
- **Risk:** Action whose `dataElementName` is missing (older saves) or whose saved name is stale (DE renamed between save and copy) cannot be repaired by the primary path. **Mitigation:** The global-ID-lookup fallback (see decision above) resolves the source DE's *current* name and retries the local match. Only fails when the source DE has been deleted entirely on its source property — that case is unrecoverable by any automated path and is reported as a `MISSING_NAME` skip.
- **Risk:** Two destination DEs share the same name. **Mitigation:** Skip with a reason; report both candidate IDs in the result so the user can disambiguate manually.
- **Risk:** PATCH fails partway through (network, permissions). **Mitigation:** Each PATCH is independent; we record the failure in the result list and continue. Already-repaired components stay repaired (idempotent — re-running the operation is safe).
- **Trade-off:** Limiting scope to this extension's action rule_components leaves other rule_components with stale DE references untouched. Acceptable because (a) we cannot fix non-extension components without overstepping ownership, and (b) the current bug only manifests for this extension's actions.
- **Trade-off:** Serial PATCHes are slower than parallel but bound below Reactor rate limits and easier to reason about. Acceptable for the initial implementation.

## Migration Plan

- This is purely additive UI within an existing extension package; no data migrations or backwards-compat shims are needed.
- Released as a normal extension version bump via the existing changeset workflow.
- Rollback: revert the changeset; users will simply lose access to the repair button. No state is persisted by the button itself, so rollback has no data implications.


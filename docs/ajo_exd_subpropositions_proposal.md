# AJO EXD subPropositions Proposal — Notes & Analysis

This document summarizes AJO's proposed approach for embedding Experience Decisioning (EXD)
decision details inside the existing `personalization:decisions` handle and propagating them
through reporting events. It compares the proposal against the current SDK behavior documented
in [personalization_handles.md](personalization_handles.md) and calls out issues, gaps, and
open questions.

**Recommendation summary:** The proposal asks the Web SDK to use `html-content-item` propositions
that is strictly more work for application developers than `dom-action` propositions, and it introduces a subset-display/dismiss API that the SDK does not
currently have. The token→item ID mapping is performed server-side by IDS (not by the SDK),
which is good — but the remaining SDK changes are still non-trivial. We recommend that the EXD
team explore surfacing EXD items as `dom-action` propositions with embedded `data-aep-click-token`
attributes instead, which would require near-zero SDK changes. See
[Recommendation: prefer EXD changes over SDK changes](#recommendation-prefer-exd-changes-over-sdk-changes)
below.

---

## What the Proposal Is

When AJO runs an Experience Decisioning policy alongside a campaign, the backend produces **two
tiers** of proposition data:

1. An **AJO campaign proposition** (`decisionProvider: "AJO"`) — the existing handle payload the
   SDK already understands.
2. An **EXD decision proposition** (`decisionProvider: "EXD"`) — richer offer-level data (item
   IDs, scores, selection/ranking detail) that does not fit cleanly in the existing AJO envelope.

Rather than surface the EXD proposition as a separate top-level item in the handle, the proposal
encodes it as a base64 blob (`subPropositions`) nested inside
`scopeDetails.characteristics` of the AJO proposition, then expects the **SDK and/or IDS to
decode and relay** the EXD detail in downstream reporting events.

Two approaches were proposed; **Approach 2 was selected**.

---

## Approach 1 (not selected) — minimal subPropositions

`subPropositions` encodes only `exdRequestId`:

```json
{ "exdRequestId": "exd-decision-request-level-id" }
```

Reporting events carry an extra proposition entry with `decisionProvider: "EXD"` whose `items`
contain per-item **tokens** (not IDs).

**Why rejected:** tokens alone are insufficient for frequency-cap counters, which need item IDs.
Also, token-based enrichment differs from the email-channel pattern (which uses item IDs), so
Approach 1 would fork the enrichment logic.

---

## Approach 2 (selected) — simplified subPropositions

`subPropositions` encodes a structured blob containing the EXD request ID, the EXD proposition
ID, and item `{ id, token }` pairs for every offered item:

```json
{
  "decisioning": {
    "exdRequestId": "exd-decision-request-level-id",
    "propositions": [
      {
        "id": "f261c04c-...",
        "decisionPolicyId": "5e76e851-...",
        "items": [
          {
            "id": "dps:bd31e93...:ffb47ca7...",
            "token": "gP07OK1WF4XbxiZb64u/hqg"
          },
          {
            "id": "dps:bd31e93...:bd346ded...",
            "token": "W/8CENhygyADFj9Q8TcLExr"
          }
        ]
      }
    ]
  }
}
```

Reporting events carry item **IDs** (not tokens) in the EXD proposition, with `exdRequestId`
pulled up to `_experience.decisioning` level. IDS does the token→item ID resolution
server-side by decoding `subPropositions` from the echoed `scopeDetails.characteristics`.

Size estimate (30 items, 1 decision policy): ~3.5 KB JSON → ~4.7 KB base64 → ~1.6 KB
compressed + base64 (zlib). Proposal notes payload can exceed 60 KB for many
campaigns/policies.

---

## Event Flow Summary (confirmed from IDS payload examples)

| Client Interaction             | SDK sends                                                                                                  | IDS action                                                                                                                                                       | Reported to AJO                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| PropositionFetch               | Standard `sendEvent`                                                                                       | Builds AJO proposition with `subPropositions` in `characteristics`; generates exchange entry with `propositionEventType.send: 1` + both AJO and EXD propositions | `send` event with `exdRequestId` + AJO and EXD propositions                               |
| PropositionDisplay (all items) | Display notification with full `scopeDetails` (incl. `subPropositions`); **no** `propositionAction.tokens` | Decodes `subPropositions`, sees no tokens → suppresses EXD proposition; threads `exdRequestId`                                                                   | `display` event with `exdRequestId`; AJO proposition only                                 |
| PropositionDisplay (subset)    | Display notification + `propositionAction.tokens: ["<token>"]` + `reason: "display"`                       | Decodes `subPropositions`, matches tokens → includes filtered EXD proposition; drops `propositionAction`                                                         | `display` event with `exdRequestId`; AJO + EXD proposition with matched item ID           |
| PropositionInteract            | Interact notification + `propositionAction.tokens: ["<token>"]` + `reason: "click"`                        | Decodes `subPropositions`, matches token → includes filtered EXD proposition; **preserves** `propositionAction`                                                  | `interact` event with `exdRequestId`; AJO + EXD proposition; `propositionAction` retained |
| PropositionDismiss (all)       | Dismiss notification with full `scopeDetails`; **no** `propositionAction.tokens`                           | Same as display-all: suppresses EXD proposition                                                                                                                  | `dismiss` event with `exdRequestId`; AJO proposition only                                 |
| PropositionDismiss (subset)    | Dismiss notification + `propositionAction.tokens: ["<token>"]` + `reason: "dismiss"`                       | Same as display-subset: filters EXD proposition; drops `propositionAction`                                                                                       | `dismiss` event with `exdRequestId`; AJO + EXD proposition with matched item ID           |

**Key insight:** IDS does all the heavy work. The SDK's only job is to (a) echo `scopeDetails.characteristics.subPropositions` verbatim in every notification (which it already does), and (b) include `propositionAction.tokens` when the application has identified which specific items were shown, clicked, or dismissed.

---

## Compatibility with Current SDK

### What works today without changes

- **Pass-through of `scopeDetails.characteristics`**: The SDK echoes `scopeDetails` verbatim in
  all display and interact notifications (Section 3 of PERSONALIZATION_HANDLES.md). This means
  `characteristics.subPropositions` and `characteristics.eventToken` will naturally appear in the
  outgoing XDM without any SDK changes. This is the core mechanism IDS relies on to correlate
  events to the original decision.

- **`propositionAction.tokens` in interact events**: The SDK already reads `data-aep-click-token`
  from the DOM and emits `propositionAction.tokens: [token]` in interact notifications. If the
  rendered HTML from AJO has `data-aep-click-token="<exd-item-token>"` on each clickable element,
  interact attribution flows automatically with zero SDK changes.

- **`propositionEventType.send`**: This is generated by IDS server-side in the `exchange` block
  when it processes the initial `/process` request. The SDK does not need to produce a "send"
  event — IDS builds it from the incoming request.

### What requires SDK changes

**1. `propositionAction.tokens` in display and dismiss events**

The display-subset and dismiss-subset flows require `propositionAction.tokens` in a display or
dismiss notification. Currently the SDK has no mechanism to produce `propositionAction` in display
or dismiss events (it only appears in interact notifications via click collection). The application
would need a new API to supply a token list when calling the display or dismiss notification, e.g.:

```js
alloy("sendEvent", {
  xdm: {
    eventType: "decisioning.propositionDisplay",
    _experience: {
      decisioning: {
        propositions: [...],
        propositionEventType: { display: 1 },
        propositionAction: {
          tokens: ["nmi5myxuN9j90aERGMBU5A"],
          reason: "display"
        }
      }
    }
  }
});
```

This is application-level XDM construction — it may not require a new SDK API if the application
assembles the XDM manually. But if the SDK is responsible for collecting which items were
displayed (e.g. via an Intersection Observer), a new display-tracking mechanism is needed.

**2. Attribute name: `data-adb-ptkn` vs `data-aep-click-token`**

The proposal's HTML content examples use `data-adb-ptkn` as the attribute baked into rendered
elements. The SDK reads `data-aep-click-token` (`CLICK_TOKEN_DATA_ATTRIBUTE` in
`createDecorateProposition.js:22`). **These are different names.** If the backend uses `data-adb-ptkn`,
the SDK will not pick up the token on click and `propositionAction.tokens` will be absent from
interact events — breaking interact attribution entirely.

Resolution: **the backend must use `data-aep-click-token`**, or the SDK must add an alias. The
backend change is simpler and does not require SDK releases.

---

## Recommendation: Prefer EXD Changes Over SDK Changes

### The `html-content-item` rendering burden

The current EXD web proposal delivers offer content as `html-content-item` — a raw HTML string
returned in the proposition's `items` array. Unlike `dom-action` items:

- The SDK **does not automatically render** `html-content-item` to the DOM. The application must
  receive it from `decisions`, find the right target element, inject the HTML, and wire up any
  interaction tracking.
- The application must know **which selector to inject into** — this information is not part of
  the `html-content-item` schema. It has to come from convention, configuration, or the
  application's own knowledge of the page structure.
- If multiple EXD items are in a single rendered block (the Handlebars loop template pattern in
  the proposal), the application has no SDK support for tracking which individual items were
  displayed vs. scrolled past — the display-subset concept requires the application to implement
  its own visibility tracking (e.g. Intersection Observer per item element) and manually
  construct the `propositionAction.tokens` array.
- Click tracking for individual EXD items inside the block also falls on the application unless
  the rendered HTML pre-bakes `data-aep-click-token` with the per-item token.

**`dom-action` items, by contrast**, have the SDK handle all of this: automatic rendering, element
decoration, click tracking, and display notification generation. The application needs to do
nothing beyond the initial `sendEvent`.

### Preferred alternative: use `dom-action` with embedded tokens

If AJO/EXD surfaces the offer content as one or more `dom-action` items (e.g. `setHtml` or
`appendHtml` targeting a known container), the SDK's existing pipeline handles rendering,
decoration, and interact tracking. The EXD per-item tokens would ride in `data-aep-click-token`
attributes inside the rendered HTML, and the SDK would pick them up automatically on click.

This approach requires:

- EXD to include a `selector` in the item data (the target container on the page).
- EXD content templates to bake `data-aep-click-token="<token>"` into each item's clickable
  element (exactly the `data-adb-ptkn` they already do, just renamed).
- No Web SDK changes for fetch, render, interact, or display-all flows.

The only gap that would remain is display-subset (tracking that only item N of N items was
scrolled into view), which is a fundamentally new concept regardless of item schema. If
display-subset attribution is not a requirement, the `dom-action` path requires **zero SDK
changes** beyond the attribute name fix.

### Preferred alternative: surface EXD propositions directly in the handle

If IDS returned the EXD proposition as a second item in `handle[0].payloads` (alongside the AJO
proposition), rather than encoding it in `subPropositions`, the SDK would process it like any
other proposition. The EXD-specific data (item IDs, tokens, strategy metadata) would be
accessible directly to the application in the `decisions` array without requiring base64
decoding. IDS could still handle the `exdRequestId` threading on the server side using the
proposition IDs it already knows.

---

## Issues and Concerns

### Attribute name mismatch: `data-adb-ptkn` vs `data-aep-click-token`

**This is a blocking issue for automatic interact tracking.** The proposal's HTML content
examples use `data-adb-ptkn` and `data-adb-plbl` as the attributes baked into rendered elements.
The SDK reads `data-aep-click-token` (`CLICK_TOKEN_DATA_ATTRIBUTE` in
`packages/browser/src/components/Personalization/handlers/createDecorateProposition.js:22`)
and `data-aep-click-label` (`CLICK_LABEL_DATA_ATTRIBUTE`).

Either:

- The backend must use the SDK's canonical attribute names (`data-aep-click-token`,
  `data-aep-click-label`), **or**
- The SDK must add aliases for the `data-adb-*` variants.

The backend fix is strongly preferred — it is a one-line template change with no SDK release cycle.

### Display-subset and dismiss-subset require application-level tracking

The SDK currently has no mechanism to accumulate per-item tokens for a display or dismiss event.
The application would need to:

1. Render the HTML from `html-content-item` into the DOM.
2. Track visibility of individual item elements (e.g. via IntersectionObserver).
3. Collect the `data-aep-click-token` value from each visible element.
4. Call back to the SDK (or construct XDM manually) with `propositionAction.tokens` when
   triggering the display notification.

This is significant application complexity. With `dom-action` items, display-all fires
automatically; display-subset is only needed if the application wants per-item impression
attribution, which is a new concept regardless of item schema.

### Payload size: the 60 KB concern

The proposal itself flags that `subPropositions` can exceed 60 KB when many campaigns/decision
policies apply. The compressed estimate is ~44% of raw size. Because `characteristics` is echoed
verbatim in every notification, the blob travels back to IDS on every display, interact, and
dismiss event for the session. This should be profiled at the expected p99 campaign complexity
before shipping.

### `correlationID` casing inconsistency

Across the proposal's JSON examples, the field appears as both `correlationID` (AJO propositions)
and `correlationId` (EXD propositions). This should be normalized before implementation.

### `decisionProvider: "EXD"` without `scopeType` or `scope`

The EXD proposition entries in reporting events sometimes lack `scope` and
`scopeDetails.characteristics.scopeType`. The SDK's scope-type resolution
(`injectCreateProposition.js`) keys off `scopeDetails.characteristics.scopeType` to decide
caching behavior. If the SDK is ever asked to process a raw EXD proposition (e.g. via
`applyPropositions`), the absence of these fields would route it to `"proposition"` scope type
and skip auto-rendering — which is probably correct for EXD items, but should be documented.

### `autoCollectPropositionInteractions` for `"EXD"` provider

The SDK's `collectInteractions.js` filters propositions by `scopeDetails.decisionProvider`
against the `autoCollectPropositionInteractions` config map. EXD HTML is delivered inside an
AJO proposition (provider `"AJO"`), so the existing `"AJO"` setting applies for DOM decoration
and click collection. The EXD proposition entries in reporting events (`decisionProvider: "EXD"`)
are built by IDS server-side — the SDK never sees them directly. No config change is required
for the existing click-collection flow.

---

## Revised SDK Work Required

Based on analysis of the actual IDS payload examples, the required SDK work is substantially
narrower than initially estimated:

| Change                                                                   | Scope                                                         | Notes                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------- |
| Accept `propositionAction.tokens[]` + `reason` on display/dismiss events | New display/dismiss notification API or application-level XDM | Required for subset attribution          |
| Backend must use `data-aep-click-token` (not `data-adb-ptkn`)            | Backend template change — NOT an SDK change                   | Blocking for automatic interact tracking |

Changes that are **NOT** required from the SDK (IDS handles these server-side):

| Initially listed as required                                       | Why it's not needed                                                                                         |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Decode `subPropositions` blob                                      | IDS decodes it from the echoed `scopeDetails.characteristics`                                               |
| Extract and propagate `exdRequestId`                               | IDS threads it from `subPropositions` into the exchange event                                               |
| Generate EXD proposition entries in display/interact notifications | IDS builds these from `subPropositions` during event processing                                             |
| Add `PropositionEventType.SEND` constant and trigger               | IDS generates the exchange `send` entry server-side on the initial `/process` call — the SDK never emits it |

---

## What the SDK Does NOT Need to Change

- `scopeDetails` pass-through — `subPropositions` rides along automatically in all notifications
  since `scopeDetails.characteristics` is echoed verbatim today. This is the core mechanism.
- `exdRequestId` propagation — IDS reads `subPropositions` from the echoed characteristics and
  threads `exdRequestId` itself.
- EXD proposition entries in exchange events — IDS builds these server-side.
- `PropositionEventType.SEND` — the `send` exchange entry is an IDS-internal action on fetch.
- Scope-type resolution — EXD items live inside an AJO proposition; scope type is resolved from
  the AJO envelope, unchanged.
- Item rendering — AJO delivers the rendered HTML as a standard `html-content-item`; no
  schema-level changes needed (though the rendering burden on applications is significant).

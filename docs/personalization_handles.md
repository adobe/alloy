# Personalization Handles — Web SDK Reference

This document describes how the Alloy Web SDK interprets the `personalization:decisions` edge network handle. It is intended for backend engineers who produce these handles and need to know exactly what structure to return so that the Web SDK can render content and generate the correct notifications.

---

## Table of Contents

1. [Handle Overview](#1-handle-overview)
2. [Top-Level Proposition Structure](#2-top-level-proposition-structure)
3. [scopeDetails](#3-scopedetails)
4. [Scope Type Resolution](#4-scope-type-resolution)
5. [Item Structure](#5-item-structure)
6. [Item Schemas](#6-item-schemas)
   - [dom-action](#61-dom-action)
   - [html-content-item](#62-html-content-item)
   - [redirect-item](#63-redirect-item)
   - [json-content-item](#64-json-content-item)
   - [default-content-item](#65-default-content-item)
   - [message/in-app](#66-messagein-app)
   - [message/content-card](#67-messagecontent-card)
   - [ruleset-item](#68-ruleset-item)
7. [DOM Action Types Reference](#7-dom-action-types-reference)
8. [Display Notifications](#8-display-notifications)
9. [Interact Notifications](#9-interact-notifications)
10. [Rendering Pipeline Summary](#10-rendering-pipeline-summary)
11. [Manual Rendering with applyPropositions](#11-manual-rendering-with-applypropositions)
12. [Complete Example Payloads](#12-complete-example-payloads)

---

## 1. Handle Overview

The Web SDK listens for the handle type `"personalization:decisions"` on edge network responses. Each payload in that handle is a **proposition** — a container that groups one or more personalization content items targeting a specific surface or scope.

```json
{
  "type": "personalization:decisions",
  "payload": [ /* array of propositions */ ]
}
```

The SDK processes all propositions in order, renders applicable content into the DOM, and then sends display or interact analytics notifications back.

---

## 2. Top-Level Proposition Structure

Each proposition payload has this shape:

```json
{
  "id": "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
  "scope": "web://mywebsite.com/homepage",
  "scopeDetails": { /* see section 3 */ },
  "items": [ /* see section 5 */ ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the proposition. Used verbatim in display and interact notifications. |
| `scope` | string | Yes | Surface identifier. Controls whether content is rendered at page load, on a view change, or not rendered automatically (see Section 4). |
| `scopeDetails` | object | Yes | Decision provider metadata. Included verbatim in all notifications. |
| `items` | array | Yes | One or more content items. Each item has a schema that determines how it is rendered. |

---

## 3. scopeDetails

The `scopeDetails` object is returned verbatim in every display and interact notification. The SDK reads two fields from it during processing:

```json
{
  "scopeDetails": {
    "decisionProvider": "AJO",
    "characteristics": {
      "scopeType": "view",
      "eventToken": "eyJtZXNzYWdl...",
      "scopeType": "view"
    },
    "strategies": [
      {
        "strategyID": "3VQe3oIqiYq2RAsYzmDTSf",
        "treatmentID": "yu7rkogezumca7i0i44v"
      }
    ],
    "activity": {
      "id": "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
    },
    "correlationID": "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
  }
}
```

| Field | Type | Required | SDK Usage |
|-------|------|----------|-----------|
| `decisionProvider` | string | Yes | Controls which interaction tracking mode applies to this proposition's items. Values: `"AJO"`, `"TGT"`. |
| `characteristics.scopeType` | string | No | When set to `"view"`, the proposition is cached and rendered only when the named view becomes active. See Section 4. |
| `characteristics.eventToken` | string | No | Opaque token passed through in notifications; not interpreted by the SDK. |
| *(any other fields)* | — | No | Passed through verbatim in notifications; not interpreted by the SDK. |

All fields in `scopeDetails` are forwarded exactly as received in the `{ id, scope, scopeDetails }` notification object sent back to analytics.

---

## 4. Scope Type Resolution

The SDK assigns each proposition one of three internal scope types that controls when and whether it renders:

| Resolved Scope Type | Condition | Rendering Behavior |
|---------------------|-----------|-------------------|
| `"page"` | `scope === "__view__"` OR `scope` matches a configured page-wide surface pattern (e.g. a URL surface) | Rendered immediately at page load |
| `"view"` | `scopeDetails.characteristics.scopeType === "view"` | Cached; rendered when the named view becomes active via `triggerView()` or `sendEvent` with `xdm.web.webPageDetails.viewName` |
| `"proposition"` | Everything else | Never auto-rendered; returned in the `decisions` array for the application to handle manually |

The special scope value `"__view__"` (exported from `pageWideScope.js`) always resolves to `"page"`.

---

## 5. Item Structure

Each element of `items` follows this shape:

```json
{
  "id": "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
  "schema": "https://ns.adobe.com/personalization/dom-action",
  "data": { /* schema-specific fields, see Section 6 */ },
  "characteristics": {
    "trackingLabel": "my-offer-label"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique item ID. Included in interact notifications to identify which items were clicked. |
| `schema` | string | Yes | URI identifying the content type. Determines which processor handles this item (see Section 6). |
| `data` | object | Yes | Schema-specific payload. See per-schema docs in Section 6. |
| `characteristics.trackingLabel` | string | No | Human-readable label added as `data-aep-click-label` on rendered DOM elements. Included in the `propositionAction.label` field of interact events. |

Items with unrecognized schemas are silently skipped (no render, no notification).

### Tracking identifiers: item ID vs tracking label vs click token

Three distinct identifiers participate in interaction tracking; they serve different purposes and travel through different paths:

| Identifier | Where it lives | Set by | Purpose |
|---|---|---|---|
| **Item ID** (`items[].id`) | Proposition payload | Backend — opaque UUID or DPS ID | Identifies the content item in analytics and frequency-cap counters. Automatically included in `propositions[].items[].id` in every interact notification. |
| **Tracking label** (`characteristics.trackingLabel`) | Item characteristics | Backend | Human-readable label for reporting. The SDK writes it to `data-aep-click-label` on decorated elements and includes it as `propositionAction.label` in interact events. |
| **Click token** (`data-aep-click-token`) | DOM attribute | Backend — pre-baked into rendered HTML by content templates | An opaque per-item tracking token used by server-side reporting to attribute events to specific decision items (e.g., for frequency-cap counters). The SDK reads this attribute during click collection and includes it as `propositionAction.tokens[0]`. **The SDK never writes this attribute** — it must be present in the rendered HTML. |

The three identifiers are complementary: the item ID is the primary key for the item record; the tracking label is for human-readable reporting dimensions; the click token is the server-side correlation handle. All three can be present on the same item.

---

## 6. Item Schemas

### 6.1 dom-action

**Schema URI:** `https://ns.adobe.com/personalization/dom-action`

Performs a targeted DOM operation on a specific element selected by a CSS selector. This is the primary schema for VEC (Visual Experience Composer) and rule-based offers.

#### data fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | The DOM operation to perform. See [Section 7](#7-dom-action-types-reference) for all values. |
| `selector` | string | Yes* | CSS selector for the target element. Required for all types except `click`. Supports the `:eq(n)` pseudo-selector for nth-child matching. |
| `prehidingSelector` | string | No | CSS selector for the element to hide before rendering to prevent flicker. Shown again immediately after rendering begins (regardless of success). |
| `content` | string \| object | Varies | The content to apply. Type depends on the `type` field — see Section 7. |

*`click` actions require `selector` but use it differently (stored for click tracking, not for element selection at render time).

#### Example

```json
{
  "id": "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
  "schema": "https://ns.adobe.com/personalization/dom-action",
  "data": {
    "type": "setHtml",
    "selector": "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
    "prehidingSelector": "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
    "content": "<h1>Hello Treatment A!</h1>"
  },
  "characteristics": {
    "trackingLabel": "hero-headline-offer"
  }
}
```

---

### 6.2 html-content-item

**Schema URI:** `https://ns.adobe.com/personalization/html-content-item`

Delivers an HTML fragment to be injected into the page. The backend provides only the content; the target selector and action type are supplied by the application at render time via `applyPropositions` metadata (see Section 11).

This schema is not automatically rendered by the SDK. Items are returned in the `decisions` array for the application to handle.

#### data fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string (HTML) | Yes | The HTML fragment to inject. |

#### Example

```json
{
  "id": "a1b2c3d4-0000-0000-0000-000000000001",
  "schema": "https://ns.adobe.com/personalization/html-content-item",
  "data": {
    "content": "<div class=\"promo\"><p>20% off today!</p></div>"
  }
}
```

---

### 6.3 redirect-item

**Schema URI:** `https://ns.adobe.com/personalization/redirect-item`

Causes the browser to navigate to a different URL. When this schema is present, the SDK:

1. Hides the `<body>` element immediately to prevent flicker.
2. Fires a display notification **before** redirecting (since the page will unload).
3. Calls `window.location = content` (or equivalent).
4. **Stops processing all other propositions** — a redirect item short-circuits the entire rendering pipeline (`onlyRenderThis: true`).

The SDK also skips the normal "show containers" call when the only page-scoped proposition contains a single redirect item, so the page stays hidden until the redirect fires.

#### data fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The URL to redirect to. |

#### Example

```json
{
  "id": "redir-item-001",
  "schema": "https://ns.adobe.com/personalization/redirect-item",
  "data": {
    "content": "https://www.example.com/treatment-b"
  }
}
```

---

### 6.4 json-content-item

**Schema URI:** `https://ns.adobe.com/personalization/json-content-item`

Returns arbitrary JSON data to the application. The SDK does **not** render this schema to the DOM. The payload is passed through in the `decisions` array for the application to handle.

#### data fields

Application-defined. The SDK passes `data` through without interpretation.

#### Example

```json
{
  "id": "json-item-001",
  "schema": "https://ns.adobe.com/personalization/json-content-item",
  "data": {
    "buttonColor": "#FF5733",
    "headerText": "Limited Offer"
  }
}
```

---

### 6.5 default-content-item

**Schema URI:** `https://ns.adobe.com/personalization/default-content-item`

Signals that the default content should be shown (i.e., no personalization applies). The SDK records this as a render attempt (contributing to display notifications) but performs no DOM changes.

#### data fields

No data fields are required. Any fields present are ignored.

#### Behavior

- `setRenderAttempted: true` — counted as a rendered item for notification purposes.
- `includeInNotification: true` — triggers a display notification.
- No DOM mutations.

---

### 6.6 message/in-app

**Schema URI:** `https://ns.adobe.com/personalization/message/in-app`

Triggers in-app message rendering via a registered module. The SDK delegates rendering to a module keyed by `data.type`.

#### data fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Module key. Defaults to `"defaultContent"` if omitted. The module must be registered in the in-app message modules map. |
| `content` | string \| object | Yes | The message content. When `contentType` is `"application/json"`, must contain `mobileParameters`, `webParameters`, and `html` sub-fields. |
| `contentType` | string | Yes | MIME type of `content`. Use `"application/json"` for structured content. |

#### When `contentType === "application/json"`, `content` must have:

| Field | Type | Description |
|-------|------|-------------|
| `html` | string | HTML markup for the message UI. |
| `webParameters` | object | Web-specific rendering parameters. |
| `mobileParameters` | object | Mobile rendering parameters (ignored on web but required for schema validation). |

#### Suppression

If the proposition's `shouldSuppressDisplay` flag is set (determined externally, e.g. by conflict resolution), the render function returns `null` and no message is shown. A suppress notification is sent instead.

#### Example

```json
{
  "id": "iam-item-001",
  "schema": "https://ns.adobe.com/personalization/message/in-app",
  "data": {
    "type": "defaultContent",
    "contentType": "application/json",
    "content": {
      "html": "<div class=\"modal\">...</div>",
      "webParameters": { "width": 400, "height": 300 },
      "mobileParameters": {}
    }
  }
}
```

---

### 6.7 message/content-card

**Schema URI:** `https://ns.adobe.com/personalization/message/content-card`

Delivers structured card content to the application. The SDK does **not** render this to the DOM automatically — it is returned in the `decisions` array for the application to render. However, it does contribute to display notifications when the application calls `sendEvent` with `renderDecisions: true` and a custom rendering handler.

#### data fields

Application-defined. Common fields observed in practice:

| Field | Type | Description |
|-------|------|-------------|
| `content` | object | Card content (title, body, imageUrl, actionUrl, actionTitle, etc.) |
| `contentType` | string | Typically `"application/json"` |
| `publishedDate` | number | Unix timestamp (ms) when the card was published |
| `expiryDate` | number | Unix timestamp (seconds) when the card expires |
| `meta` | object | Contains `surface` — the web surface URL this card targets |

#### Example

```json
{
  "id": "card-item-001",
  "schema": "https://ns.adobe.com/personalization/message/content-card",
  "data": {
    "contentType": "application/json",
    "publishedDate": 1677752640000,
    "expiryDate": 1712190456,
    "meta": {
      "surface": "web://mywebsite.com/my-cards"
    },
    "content": {
      "title": "Welcome!",
      "body": "Check out our latest offers.",
      "imageUrl": "https://cdn.example.com/offer.png",
      "actionUrl": "https://example.com/offers",
      "actionTitle": "Shop Now"
    }
  }
}
```

---

### 6.8 ruleset-item

**Schema URI:** `https://ns.adobe.com/personalization/ruleset-item`

Contains a ruleset evaluated client-side by the Rules Engine component. The Personalization component does not process this schema directly — it is handled by the Rules Engine. Not rendered to the DOM by the Personalization pipeline.

---

## 7. DOM Action Types Reference

Applies to items with schema `dom-action`. The `data.type` field selects the operation. All HTML-producing actions parse the HTML string into a DOM fragment, add CSP nonces to inline `<style>` elements, preload images, and execute inline and remote `<script>` tags.

| `type` value | `content` type | Description |
|--------------|---------------|-------------|
| `setHtml` | string (HTML) | Clears all children of the matched element, then appends the HTML fragment. Decorates the container element. |
| `customCode` | string (HTML) | Alias for `prependHtml`. Prepends the HTML fragment before the first child. |
| `appendHtml` | string (HTML) | Appends HTML fragment as last children of the matched element. Decorates the container. |
| `prependHtml` | string (HTML) | Prepends HTML fragment as first children. Decorates the container. |
| `replaceHtml` | string (HTML) | Inserts HTML fragment before the matched element, then removes the matched element. Decorates inserted elements. |
| `insertAfter` | string (HTML) | Inserts HTML fragment as siblings immediately after the matched element. Decorates each inserted element. |
| `insertBefore` | string (HTML) | Inserts HTML fragment as siblings immediately before the matched element. Decorates each inserted element. |
| `setText` | string (text) | Sets `element.textContent` of the matched element. Decorates the element. |
| `setAttribute` | object | Sets each key-value pair as an attribute on the matched element (e.g., `{ "src": "new.png" }`). Decorates the element. |
| `setImageSource` | string (URL) | Replaces the `src` attribute of the matched `<img>` element. Starts loading the image before switching to prevent flicker. Decorates the element. |
| `setStyle` | object | Applies CSS style properties to the matched element. Supports an optional `priority` key (`"important"`). Keys other than `priority` are passed to `element.style`. Decorates the element. |
| `move` | object | Repositions the matched element by setting `left` and `top` CSS properties (auto-appends `px` if no unit). Supports `priority`. |
| `resize` | object | Resizes the matched element by setting `width` and `height` CSS properties (auto-appends `px` if no unit). Supports `priority`. |
| `rearrange` | object `{ from, to }` | Swaps two children of the matched element by index. `from` and `to` are zero-based child indices. |
| `remove` | — | Removes the matched element from the DOM. No `content` needed. |
| `click` | — | Does **not** render anything. Registers the `selector` for click-based conversion tracking. When a user later clicks an element matching the selector, an interact notification is fired. See Section 9. |
| `collectInteractions` | — | Registers the matched element's container for interaction tracking by decorating it with `data-aep-interact-id`. Used when `autoCollectPropositionInteractions` is enabled. |

### Selector syntax

The `selector` and `prehidingSelector` fields accept standard CSS selectors plus the `:eq(n)` extension (zero-based index among matching elements), e.g.:

```
HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)
```

The SDK waits for the selected element to appear in the DOM (up to a timeout) before rendering, so selectors targeting dynamically-rendered content work as long as the element appears within the configured timeout.

---

## 8. Display Notifications

A display notification is sent automatically after content is rendered. It tells analytics that the user was shown personalized content.

### When a display notification fires

A display notification fires for a proposition when **at least one item** in that proposition has `includeInNotification: true`. The following schemas set `includeInNotification: true`:

- `dom-action` (all types except unrecognized ones)
- `html-content-item`
- `redirect-item` (fires before the redirect)
- `default-content-item`
- `message/in-app`

Schemas that never produce display notifications: `json-content-item`, `message/content-card` (when returned as decisions), `ruleset-item`.

### Full XDM payload

The SDK sends a standalone analytics event. The full XDM body looks like this:

```json
{
  "eventType": "decisioning.propositionDisplay",
  "_experience": {
    "decisioning": {
      "propositions": [
        {
          "id": "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          "scope": "web://mywebsite.com/homepage",
          "scopeDetails": {
            "decisionProvider": "AJO",
            "characteristics": { "scopeType": "view" },
            "activity": { "id": "campaign-001#action-001" }
          }
        },
        {
          "id": "a1b2c3d4-0000-0000-0000-000000000001",
          "scope": "__view__",
          "scopeDetails": {
            "decisionProvider": "TGT"
          }
        }
      ],
      "propositionEventType": {
        "display": 1
      }
    }
  }
}
```

Key points:

- **No `items` array** — each proposition entry contains only `id`, `scope`, and `scopeDetails` (verbatim from the handle).
- **No `propositionAction`** — `trackingLabel` and click tokens are never included in display notifications. They only appear in interact notifications (see Section 9).
- **`propositionEventType.display` is always `1`** (a sentinel true value, not a count).
- Multiple rendered propositions are batched into a single event's `propositions` array.
- For view-scoped propositions, the event also includes `web.webPageDetails.viewName` at the top level of the XDM.

### Suppressed display

When conflict resolution suppresses a proposition, a separate event fires with `eventType: "decisioning.propositionSuppressDisplay"` and an additional `propositionAction: { reason: "Conflict" }` field inside `_experience.decisioning`.

### Redirect-specific behavior

For redirect items, the display notification is sent with `navigator.sendBeacon` rather than `fetch` (flagged via `documentMayUnload: true`) to ensure delivery as the page unloads.

---

## 9. Interact Notifications

An interact notification fires when a user clicks an element that was personalized. There are two mechanisms that produce interact notifications, and they can fire together in the same click event.

### Mechanism 1: `click` DOM action

When a `dom-action` item has `type: "click"`, the SDK registers the `selector` for click tracking. On a matching click the SDK adds the proposition's `{ id, scope, scopeDetails }` to `decisionsMeta` and, if the item has a `trackingLabel`, sets `propositionAction.label`.

### Mechanism 2: `data-aep-interact-id` decoration

When `autoCollectPropositionInteractions` is enabled for a decision provider, the SDK decorates every rendered container element with data attributes used during click collection:

| Attribute | Written by | Source | Carried into notification as |
|-----------|-----------|--------|------------------------------|
| `data-aep-interact-id` | SDK (auto) | Auto-generated integer (per rendered item) | Internal lookup key — not in XDM |
| `data-aep-click-label` | SDK | `characteristics.trackingLabel` on the item | `propositionAction.label` |
| `data-aep-click-token` | **Backend** (not SDK) | Opaque token pre-baked into the rendered HTML by content templates | `propositionAction.tokens[0]` |

The `data-aep-click-token` attribute is intentionally left for the backend to populate. Content templates should embed the per-item token in the rendered HTML before the SDK receives it — for example, `<li data-aep-click-token="abc123">…</li>`. The SDK reads it but never writes it. This design allows server-side reporting systems to correlate click events back to specific decision items (e.g., for frequency caps) using a token that only the server can interpret.

On every page click, the SDK walks up the DOM from the clicked element to `<html>` collecting all `data-aep-interact-id` values it encounters. Each ID maps to stored `{ id, scope, scopeDetails, items }` metadata for the propositions that rendered that element.

The `autoCollectPropositionInteractions` setting per decision provider:

| Mode | Behavior |
|------|----------|
| `"always"` | Every click on a decorated element fires an interact event |
| `"decoratedElementsOnly"` | Only fires if a `data-aep-click-label` or `data-aep-click-token` is found in the ancestry |
| `"never"` | Interact tracking disabled for this provider |

### Label and token resolution when multiple elements match a single click

Both mechanisms walk up the DOM tree from the clicked element. When multiple elements in the ancestry chain carry `data-aep-click-label` (or a `trackingLabel` via the `click` action mechanism), only **one label** ends up in the notification:

- **`collectInteractions` (Mechanism 2)** uses `clickLabel = clickLabel || getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)` — the first non-null value found while walking inward-to-outward wins. The innermost element's label takes precedence; any ancestor labels are ignored.
- **`collectClicks` (Mechanism 1)** selects the label from whichever registered selector matched at the smallest ancestor distance (lowest `weight`). Ties go to the first match evaluated.
- **Between mechanisms**: `createOnClickHandler` processes `collectInteractions` before `collectClicks`. If Mechanism 2 found a label, Mechanism 1's label is ignored. The single winning label is placed in `propositionAction.label`.

The same innermost-wins rule applies to `data-aep-click-token` / `propositionAction.tokens[0]`.

Multiple propositions can still be reported in a single notification — all `data-aep-interact-id` values collected during the traversal are resolved to their respective propositions and included in the `propositions` array together.

### Full XDM payload

The SDK merges interact data onto the existing click event (not a new standalone request):

**Minimal — no label or token:**
```json
{
  "eventType": "decisioning.propositionInteract",
  "_experience": {
    "decisioning": {
      "propositions": [
        {
          "id": "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          "scope": "web://mywebsite.com/homepage",
          "scopeDetails": {
            "decisionProvider": "AJO",
            "activity": { "id": "campaign-001#action-001" }
          },
          "items": [
            { "id": "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe" }
          ]
        }
      ],
      "propositionEventType": {
        "interact": 1
      }
    }
  }
}
```

**With label and token:**
```json
{
  "eventType": "decisioning.propositionInteract",
  "_experience": {
    "decisioning": {
      "propositions": [
        {
          "id": "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          "scope": "web://mywebsite.com/homepage",
          "scopeDetails": {
            "decisionProvider": "AJO",
            "activity": { "id": "campaign-001#action-001" }
          },
          "items": [
            { "id": "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe" }
          ]
        }
      ],
      "propositionEventType": {
        "interact": 1
      },
      "propositionAction": {
        "label": "hero-headline-offer",
        "tokens": ["ewoibWVzc2FnZUV4ZWN1dGlvbiI6ey4uLn0="]
      }
    }
  }
}
```

**With a view-scoped proposition (adds `web.webPageDetails.viewName`):**
```json
{
  "eventType": "decisioning.propositionInteract",
  "web": {
    "webPageDetails": {
      "viewName": "checkout"
    }
  },
  "_experience": {
    "decisioning": {
      "propositions": [
        {
          "id": "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
          "scope": "checkout",
          "scopeDetails": {
            "decisionProvider": "AJO",
            "characteristics": { "scopeType": "view" }
          },
          "items": [
            { "id": "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7" }
          ]
        }
      ],
      "propositionEventType": {
        "interact": 1
      }
    }
  }
}
```

Key differences from display notifications:

- Each proposition entry **includes an `items` array** with `{ id }` for each item that was interacted with.
- **`propositionAction`** is present only when a label or token was resolved. If neither exists, the field is omitted entirely.
- **`propositionAction.tokens` is always an array** with a single element (the token string).
- `trackingLabel` from `item.characteristics` is the source for `propositionAction.label`. It is **stripped from the `propositions` entries** before the notification is sent — it does not appear inside `propositions[].scopeDetails` or anywhere else in the XDM body.

---

## 10. Rendering Pipeline Summary

```
Edge response received
└─ Extract handle: "personalization:decisions"

For each handle payload:
└─ Create proposition wrapper (id, scope, scopeDetails, items)

Group propositions by scope type:
├─ page  → render immediately
├─ view  → cache; render on matching view activation
└─ proposition → pass through as unrendered decisions

For each proposition to render:
└─ For each item in proposition.items:
   ├─ Look up schema processor
   ├─ dom-action: validate type + selector; build render function
   ├─ html-content-item: not auto-rendered; returned in decisions array
   ├─ redirect-item: build render function; set onlyRenderThis = true
   ├─ default-content-item: no render; includeInNotification = true
   ├─ message/in-app: delegate to in-app module
   └─ unknown schema: skip

Render phase (async):
└─ For each render function:
   ├─ hideElements(prehidingSelector)
   ├─ awaitSelector(selector) — waits for DOM element to appear
   ├─ For each matched container:
   │  ├─ Check renderStatusHandler (prevents re-rendering same element)
   │  ├─ Call renderFunc(container, content, decorateProposition)
   │  └─ markAsRendered(container)
   └─ showElements(prehidingSelector)  [in finally block]

Post-render:
└─ Collect { id, scope, scopeDetails } for each successful render
└─ Send display notification via collect()

On user click:
├─ Traverse DOM for data-aep-interact-id attributes
├─ Look up stored metadata for each interact ID
├─ Check autoCollectPropositionInteractions config
└─ Send interact notification if criteria met
```

---

## 11. Manual Rendering with applyPropositions

Some proposition types are never rendered automatically by the SDK. These fall into the SDK-internal scope type `"proposition"` — anything that is not the `__view__` scope, not a page-wide surface pattern, and does not have `scopeDetails.characteristics.scopeType: "view"`. The application receives these in the `decisions` array of the `sendEvent` result and is responsible for rendering them and notifying the SDK when they have been displayed or interacted with.

The SDK exposes an `alloy("applyPropositions", { ... })` command for this purpose. It re-runs the same rendering pipeline used for automatic propositions and registers the same interaction tracking. However, unlike automatic rendering, `applyPropositions` does **not** automatically send a display notification. The rendered proposition metadata is queued internally and sent only when a subsequent `sendEvent` call includes `personalization: { includeRenderedPropositions: true }` (see Section 11.6).

---

### 11.1 When to use applyPropositions

Use `applyPropositions` when:

- Propositions were returned with a custom scope (e.g. `"my-sidebar"`, `"product-recommendations"`) and the application needs to decide where and when to render them.
- The application fetched propositions without `renderDecisions: true` and now wants to render them after some async setup (e.g. a component mounted, a modal opened).
- Items use the `html-content-item` schema, which requires the application to supply the target CSS selector because the backend does not embed one.
- The application implements a SPA view system and needs to replay cached view-scoped propositions.

---

### 11.2 Command signature

```javascript
alloy("applyPropositions", {
  propositions,   // required — array of proposition objects from sendEvent result
  metadata,       // optional — map of scope → { selector, actionType }
  viewName,       // optional — view name to pull from view cache
})
```

All three parameters are described below.

---

### 11.3 propositions

The `propositions` array must contain proposition objects exactly as returned in the `decisions` (or `propositions`) array of a previous `sendEvent` call. The SDK validates that each entry has `id`, `scope`, `scopeDetails.decisionProvider`, and a non-empty `items` array — validation failures are logged as warnings and the call returns an empty array.

**Schemas that will be rendered by `applyPropositions`:**

| Schema | Behavior |
|--------|----------|
| `dom-action` | Rendered as-is using the embedded `selector`, `type`, and `content` from `data`. |
| `html-content-item` | Requires a matching entry in `metadata` (see 11.4). Dropped silently if no metadata entry exists for the proposition's scope. |
| `message/in-app` | Rendered via the in-app message module. |
| `default-content-item` | No DOM change; contributes a display notification. |
| `json-content-item` (with `collectInteractions` action type) | Registers the DOM element for interaction tracking. Requires metadata. |

**Schemas that are ignored:**

- `redirect-item` — redirects are not safe to execute outside the initial page-load rendering context.
- `message/content-card` — the application is expected to render these itself.
- `ruleset-item` — handled by the Rules Engine component, not `applyPropositions`.
- Any unrecognized schema.

**Already-rendered page-wide propositions are skipped:**

If a proposition has `scope === "__view__"` and `renderAttempted === true`, it is filtered out automatically. This prevents double-rendering page-wide content that the SDK already rendered automatically.

---

### 11.4 metadata

The `metadata` parameter is a plain object keyed by proposition `scope`. It is required for propositions that use `html-content-item` (or `json-content-item` with `collectInteractions`), because those schemas carry content without a target selector.

```javascript
{
  "<scope-value>": {
    selector:   string,  // CSS selector for the container element to render into
    actionType: string,  // DOM action type to use (e.g. "appendHtml", "setHtml")
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `selector` | string | CSS selector passed to the DOM action as `data.selector`. The SDK waits for this element to appear before rendering. |
| `actionType` | string | Which DOM action to perform. Must be one of the HTML-producing types listed in Section 7 (`appendHtml`, `prependHtml`, `setHtml`, `replaceHtml`, `insertBefore`, `insertAfter`). |

**What happens without metadata for an `html-content-item`:**
The item is dropped from the proposition before processing. If all items in a proposition are dropped, the entire proposition is removed and produces no notification.

**`dom-action` items ignore metadata entirely** — their `selector`, `type`, and `content` come from `data` and are not overridden.

**`html-content-item` items require a metadata entry** — if no entry exists for the proposition's scope, the item is dropped and produces no notification.

---

### 11.5 viewName

Pass a `viewName` string to additionally render all cached propositions for that view. This is equivalent to the SDK's built-in view-change rendering, but called manually — useful in SPAs that manage routing outside the standard `triggerView` / `sendEvent` flow.

When `viewName` is provided, the SDK fetches all view-scoped propositions for that name from its internal cache (populated by prior `sendEvent` calls) and appends them to the propositions passed in `propositions`. Both sets go through the same rendering pipeline together.

---

### 11.6 Sending the display notification

`applyPropositions` does not send a display notification on its own. Instead, it queues the rendered proposition metadata internally. To send the display notification, make a subsequent `sendEvent` call with `personalization.includeRenderedPropositions` set to `true`:

```javascript
await alloy("applyPropositions", {
  propositions: decisions,
  metadata: {
    "my-sidebar": { selector: "#sidebar-slot", actionType: "appendHtml" },
  },
});

// Later — often on the next user interaction or page event:
alloy("sendEvent", {
  xdm: { /* any other event data */ },
  personalization: {
    includeRenderedPropositions: true,
  },
});
```

When `includeRenderedPropositions: true` is present, the SDK drains the internal queue of all rendered proposition metadata accumulated since the last drain (including anything rendered by `applyPropositions` as well as any automatic renders whose display notification was also deferred), merges them into the outgoing event's XDM as a `decisioning.propositionDisplay` notification, and clears the queue.

The display data is merged into the `sendEvent` XDM — it is not a separate HTTP request.

If `sendEvent` is called without `includeRenderedPropositions: true`, the queued metadata is left in place and will be included in the first subsequent call that does set the flag.

### 11.7 Return value

`applyPropositions` returns a promise that resolves to:

```javascript
{
  propositions: [
    {
      id: "...",
      scope: "...",
      scopeDetails: { ... },
      items: [ /* items that were processed */ ],
      renderAttempted: true
    }
  ]
}
```

`renderAttempted: true` is set on all returned propositions regardless of whether individual item renders succeeded. No display notification is sent at this point.

---

### 11.8 Implications for handle design

How you design the backend handle determines what the calling application must supply:

| Backend choice | Auto-renders? | Notes |
|----------------|--------------|-------|
| `dom-action` with `selector` + `type` in `data`, page-wide scope | Yes | Renders without any application code; also re-renderable via `applyPropositions` without metadata |
| `html-content-item`, any scope | No | Application must call `applyPropositions` with a `metadata[scope]` entry supplying `selector` and `actionType` |
| Any schema, custom scope | No | Application must call `applyPropositions`; `html-content-item` still requires `metadata` |

**Guidance:**

- If the backend can determine the target selector at decision time and you want automatic rendering, use `dom-action` with the selector embedded in `data`.
- Use `html-content-item` when the application determines the injection point at runtime (e.g. a component that mounts after the response arrives). The application must call `applyPropositions` with a `metadata` entry.
- Custom scopes never auto-render regardless of schema.

---

### 11.9 Example: rendering non-automatic propositions

A `sendEvent` call with `renderDecisions: false` (or with propositions that have a custom scope) puts all propositions in `decisions`:

```javascript
const { decisions } = await alloy("sendEvent", {
  renderDecisions: false,
  xdm: { /* ... */ },
});

// decisions contains propositions for custom scopes like "my-sidebar"
// They were not rendered automatically.
```

Later, once the application's sidebar component has mounted:

```javascript
await alloy("applyPropositions", {
  propositions: decisions,
  metadata: {
    "my-sidebar": {
      selector: "#sidebar-slot",
      actionType: "appendHtml",
    },
  },
});
// Content is rendered and elements are decorated for interaction tracking.
// No display notification has been sent yet.

// Send the display notification by including it in the next sendEvent call:
alloy("sendEvent", {
  xdm: { /* any other event data */ },
  personalization: { includeRenderedPropositions: true },
});
```

**For `dom-action` propositions** in the same `decisions` array, no metadata is needed — the SDK uses the embedded `selector` and `type` from each item's `data`:

```javascript
await alloy("applyPropositions", {
  propositions: decisions,
  // No metadata needed: dom-action items carry their own selector and type
});
alloy("sendEvent", {
  personalization: { includeRenderedPropositions: true },
});
```

---

### 11.10 Example: SPA view rendering

```javascript
// User navigated to the /checkout view in an SPA
await alloy("applyPropositions", {
  propositions: [],       // no extra propositions to apply
  viewName: "checkout",  // render all cached view-scoped propositions for "checkout"
});
```

This is functionally equivalent to:

```javascript
alloy("sendEvent", {
  renderDecisions: true,
  xdm: { web: { webPageDetails: { viewName: "checkout" } } },
});
```

but does not send a new network request — it only renders what the SDK already cached from a previous `sendEvent`.

---

## 12. Complete Example Payloads

### Page-scoped proposition with DOM mutations (Adobe Target)

```json
{
  "type": "personalization:decisions",
  "payload": [
    {
      "id": "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
      "scope": "__view__",
      "scopeDetails": {
        "decisionProvider": "TGT",
        "characteristics": {},
        "activity": {
          "id": "activity-001"
        }
      },
      "items": [
        {
          "id": "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
          "schema": "https://ns.adobe.com/personalization/dom-action",
          "data": {
            "type": "setHtml",
            "selector": "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
            "prehidingSelector": "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
            "content": "<h1>Treatment A Headline</h1>"
          },
          "characteristics": {
            "trackingLabel": "hero-headline"
          }
        },
        {
          "id": "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
          "schema": "https://ns.adobe.com/personalization/dom-action",
          "data": {
            "type": "setAttribute",
            "selector": "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
            "prehidingSelector": "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
            "content": {
              "src": "img/treatment-a-offer.png"
            }
          }
        },
        {
          "id": "click-item-001",
          "schema": "https://ns.adobe.com/personalization/dom-action",
          "data": {
            "type": "click",
            "selector": "#buy-now-button"
          },
          "characteristics": {
            "trackingLabel": "buy-now-cta"
          }
        }
      ]
    }
  ]
}
```

### View-scoped proposition (Adobe Journey Optimizer)

```json
{
  "type": "personalization:decisions",
  "payload": [
    {
      "id": "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
      "scope": "web://mywebsite.com/checkout",
      "scopeDetails": {
        "decisionProvider": "AJO",
        "characteristics": {
          "scopeType": "view",
          "eventToken": "eyJtZXNzYWdl..."
        },
        "activity": {
          "id": "campaign-001#action-001"
        },
        "correlationID": "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
      },
      "items": [
        {
          "id": "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
          "schema": "https://ns.adobe.com/personalization/dom-action",
          "data": {
            "type": "appendHtml",
            "selector": "#checkout-banner",
            "prehidingSelector": "#checkout-banner",
            "content": "<div class=\"urgency-banner\">Only 3 left in stock!</div>"
          }
        }
      ]
    }
  ]
}
```

### Redirect proposition

```json
{
  "type": "personalization:decisions",
  "payload": [
    {
      "id": "redirect-prop-001",
      "scope": "__view__",
      "scopeDetails": {
        "decisionProvider": "TGT",
        "characteristics": {}
      },
      "items": [
        {
          "id": "redirect-item-001",
          "schema": "https://ns.adobe.com/personalization/redirect-item",
          "data": {
            "content": "https://www.example.com/treatment-b-page"
          }
        }
      ]
    }
  ]
}
```

### Content card proposition (not auto-rendered)

```json
{
  "type": "personalization:decisions",
  "payload": [
    {
      "id": "1a3d874f-39ee-4310-bfa9-6559a10041a4",
      "scope": "web://mywebsite.com/my-cards",
      "scopeDetails": {
        "decisionProvider": "AJO",
        "characteristics": {}
      },
      "items": [
        {
          "id": "a48ca420-faea-467e-989a-5d179d9f562d",
          "schema": "https://ns.adobe.com/personalization/message/content-card",
          "data": {
            "contentType": "application/json",
            "publishedDate": 1677752640000,
            "expiryDate": 1712190456,
            "meta": {
              "surface": "web://mywebsite.com/my-cards"
            },
            "content": {
              "title": "Welcome to Lumon!",
              "body": "A handshake is available upon request.",
              "imageUrl": "img/lumon.png",
              "actionTitle": "Shop the sale!",
              "actionUrl": "https://luma.com/sale"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Key Source Files

| File | Purpose |
|------|---------|
| [`packages/core/src/constants/schema.js`](../packages/core/src/constants/schema.js) | Schema URI constants |
| [`packages/browser/src/components/Personalization/createFetchDataHandler.js`](../packages/browser/src/components/Personalization/createFetchDataHandler.js) | Entry point: extracts handles, groups by scope type, triggers rendering |
| [`packages/browser/src/components/Personalization/handlers/injectCreateProposition.js`](../packages/browser/src/components/Personalization/handlers/injectCreateProposition.js) | Proposition wrapper; scope type resolution |
| [`packages/browser/src/components/Personalization/handlers/createProcessPropositions.js`](../packages/browser/src/components/Personalization/handlers/createProcessPropositions.js) | Main rendering loop; notification collection |
| [`packages/browser/src/components/Personalization/handlers/createProcessDomAction.js`](../packages/browser/src/components/Personalization/handlers/createProcessDomAction.js) | `dom-action` schema processor |
| [`packages/browser/src/components/Personalization/handlers/createProcessHtmlContent.js`](../packages/browser/src/components/Personalization/handlers/createProcessHtmlContent.js) | `html-content-item` schema processor |
| [`packages/browser/src/components/Personalization/handlers/createProcessRedirect.js`](../packages/browser/src/components/Personalization/handlers/createProcessRedirect.js) | `redirect-item` schema processor |
| [`packages/browser/src/components/Personalization/handlers/createProcessInAppMessage.js`](../packages/browser/src/components/Personalization/handlers/createProcessInAppMessage.js) | `message/in-app` schema processor |
| [`packages/browser/src/components/Personalization/dom-actions/initDomActionsModules.js`](../packages/browser/src/components/Personalization/dom-actions/initDomActionsModules.js) | DOM action type registry |
| [`packages/browser/src/components/Personalization/dom-actions/action.js`](../packages/browser/src/components/Personalization/dom-actions/action.js) | Generic action factory: selector waiting, flicker management |
| [`packages/browser/src/components/Personalization/handlers/createDecorateProposition.js`](../packages/browser/src/components/Personalization/handlers/createDecorateProposition.js) | DOM decoration with interact-tracking attributes |
| [`packages/browser/src/components/Personalization/createInteractionStorage.js`](../packages/browser/src/components/Personalization/createInteractionStorage.js) | In-memory storage of interact metadata |
| [`packages/browser/src/components/Personalization/createOnClickHandler.js`](../packages/browser/src/components/Personalization/createOnClickHandler.js) | Click handler; builds and fires interact events |
| [`packages/browser/src/components/Personalization/createNotificationHandler.js`](../packages/browser/src/components/Personalization/createNotificationHandler.js) | Display notification dispatch |
| [`packages/core/src/constants/propositionEventType.js`](../packages/core/src/constants/propositionEventType.js) | Event type constants (display, interact, suppress, etc.) |
| [`packages/core/src/constants/propositionInteractionType.js`](../packages/core/src/constants/propositionInteractionType.js) | Interaction tracking mode constants |
| [`packages/browser/src/components/Personalization/constants/scopeType.js`](../packages/browser/src/components/Personalization/constants/scopeType.js) | Scope type constants |

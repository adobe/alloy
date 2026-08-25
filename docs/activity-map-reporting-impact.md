# Activity Map / link-click XDM payloads and their reporting impact

**Audience:** Adobe Analytics back-end / implementation developers who need to
understand *what actually lands in reporting* when the Web SDK (Alloy) collects a
link click — and how the `clickCollection.eventGroupingEnabled` setting changes the
shape of the hit and therefore the metrics.

This is written from the Alloy source in
`packages/browser/src/components/ActivityCollector/` and reconciled against Experience
League (Edge Network hit-types, Activity Map, clickCollection) and the internal AEP wiki.

---

## TL;DR

The SDK produces one of two hit shapes for a link click:

| | **Immediate** (`eventGroupingEnabled: false`, default) | **Grouped** (`eventGroupingEnabled: true`) |
|---|---|---|
| Hit shape | Its own hit: `eventType = web.webinteraction.linkClicks` | No own hit — link data is merged into the **next page view** (`eventType = web.webpagedetails.pageViews`) |
| Edge classifies as | **Link event** (custom link, `type: "other"`) | **Page view** (the click rides along as Activity Map context data) |
| Page Views metric | Not incremented | Incremented normally (the page view it merged into) |
| Custom Link Instances | **+1 per click** | **Not incremented** — click has no standalone link hit |
| Activity Map dimensions | Populated (from the click's own hit) | Populated (from the following page-view hit) |
| Server calls | 1 per collected click | 0 for the click (folded into the page view) |
| Scope | all link types | **internal, same-domain links only** — exit/download still send immediately |

**Net for reporting:** turning grouping on **lowers "Custom Link Instances"** and total
server calls, leaves **Page Views unchanged**, and **keeps Activity Map reporting working**
because Activity Map is driven by context data (`a.activitymap.*`), not by the link hit
itself. Grouping is the modern equivalent of classic AppMeasurement's "append Activity Map
data to the next page view" behavior.

There is one **documented ambiguity in the Edge hit-types rules** for the grouped shape —
see [The dual-payload classification caveat](#the-dual-payload-classification-caveat). If
exact hit classification is load-bearing for you, confirm with the Edge translator owners.

---

## The two payload shapes

Both are built by `createClickedElementProperties.js`. Reporting-relevant fields are shown;
the rest of the payload (`identityMap`, `device`, `environment`, `placeContext`,
`implementationDetails`, `timestamp`) is auto-collected context and identical in both.

Scenario for both: user on **Home Page** (`https://example.com/`) clicks internal nav link
**"View Products"** → `https://example.com/products`, inside `<nav id="primary-nav">`.

### Shape 1 — Immediate (`eventGroupingEnabled: false`)

Sent as its own hit the moment the click happens:

```json
{
  "xdm": {
    "eventType": "web.webinteraction.linkClicks",
    "web": {
      "webInteraction": {
        "name": "View Products",
        "region": "primary-nav",
        "type": "other",
        "URL": "https://example.com/products",
        "linkClicks": { "value": 1 }
      },
      "webPageDetails": { "URL": "https://example.com/" }
    }
  },
  "data": {
    "__adobe": { "analytics": { "contextData": { "a": { "activitymap": {
      "page": "Home Page",
      "link": "View Products",
      "region": "primary-nav",
      "pageIDType": 1
    } } } } }
  }
}
```

Note there is **no** `web.webPageDetails.name` — only `.URL` (auto-added). The page *name*
lives only in the `a.activitymap.page` context data. This is deliberate so a click can never
inflate Page Views.

### Shape 2 — Grouped (`eventGroupingEnabled: true`)

Nothing is sent on the click. On the **next page view** (Products), the stored click is
recalled, its `eventType` is deleted, and `web.webInteraction` + the `activitymap` context
data are merged into the page-view hit:

```json
{
  "xdm": {
    "eventType": "web.webpagedetails.pageViews",
    "web": {
      "webPageDetails": {
        "name": "Products Page",
        "URL": "https://example.com/products",
        "pageViews": { "value": 1 }
      },
      "webInteraction": {
        "name": "View Products",
        "region": "primary-nav",
        "type": "other",
        "URL": "https://example.com/products",
        "linkClicks": { "value": 1 }
      }
    }
  },
  "data": {
    "__adobe": { "analytics": { "contextData": { "a": { "activitymap": {
      "page": "Home Page",
      "link": "View Products",
      "region": "primary-nav",
      "pageIDType": 1
    } } } } }
  }
}
```

**The field that trips people up:** on the grouped hit, `web.webPageDetails.name` is
`"Products Page"` (the page being viewed *now*), while `a.activitymap.page` is `"Home Page"`
(the page the link was clicked *on*). They differ on purpose — the page view and the click
are two different moments stitched into one hit. This is why the **Activity Map Page**
dimension reports the *originating* page, not the destination.

---

## How Edge classifies each hit

Source: [Edge Network event types in Adobe Analytics](https://experienceleague.adobe.com/en/docs/analytics/implementation/aep-edge/hit-types).
The translator decides page-view vs. link event from the XDM (ordered rules, quoted):

- `webPageDetails.name`/`.URL` present **and no** `webInteraction.type` → **page view**
- `eventType = web.webpagedetails.pageViews` → **page view**
- `webInteraction.type` **and** (`webPageDetails.name`/`.URL`) → **link event**; *also sets `webPageDetails.name`/`.URL` to null*
- `webInteraction.type` **and** (`webInteraction.name`/`.URL`) → **link event**; *also nulls `webPageDetails.name`/`.URL`*
- none of `webInteraction.type`, `webPageDetails.name`, `webPageDetails.URL` → **payload dropped**

**Shape 1** → last-applicable link rule → **link event**. Because `type: "other"` it is a
**custom link**. A custom link is a *page event*; per the [`tl` method](https://experienceleague.adobe.com/en/docs/analytics/implementation/vars/functions/tl-method)
it does **not** increment Page Views. So Shape 1 = one Custom Link Instance, zero Page Views.

**Shape 2** → classified as a **page view** (by `eventType = web.webpagedetails.pageViews`),
`pageViews.value: 1` increments Page Views normally, and the click is represented purely as
Activity Map context data on that hit. The internal click therefore does **not** produce its
own Custom Link Instance.

### The dual-payload classification caveat

Read literally, Shape 2 matches **two conflicting rules at once**: the `eventType` page-view
rule *and* the "`webInteraction.type` + `webPageDetails.name` → link event, null out page
details" rule. The public hit-types doc **does not state a precedence order** and does not
say whether `eventType` overrides the presence-based rules. Taken literally, the link-event
rule would null `webPageDetails.name`/`.URL` and could suppress page-view counting for every
grouped hit — which is clearly not the intended behavior.

The authoritative product-behavior docs indicate the intended outcome is *page view + Activity
Map context data*:

- [Activity Map FAQ](https://experienceleague.adobe.com/en/docs/analytics/analyze/activity-map/faq):
  "Activity Map does not send server calls by itself... Activity Map context data variables
  are included with Analytics page view calls on the subsequent page... If you are on the
  latest version of the Web SDK, **Activity Map data is merged with the following event.**"
- [clickCollection](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/clickcollection):
  with grouping the library "**wait[s] until the next 'page view' event to send link tracking
  data**" and "combines stored link tracking data with the rest of the data in that event."

**Action for the back-end team:** if precise hit classification of the grouped payload matters
to you (e.g., you are debugging why an internal-link Instance did or did not appear), confirm
the translator's rule precedence with the Edge team rather than relying on the hit-types table
alone. The observable product behavior is: grouped hit = page view, click = Activity Map data.

---

## Where each metric comes from

- **Page Views** — from `web.webPageDetails.name`/`.URL` + `pageViews.value` on a page-view
  hit. Only Shape 2 contributes (it *is* a page view). Shape 1 never does.
- **Custom / Exit / Download Link Instances** — from `web.webInteraction` on a *link* hit.
  Only Shape 1 (and always-immediate exit/download clicks) contribute. Grouped internal clicks
  do **not** add Instances. This is the single biggest reporting delta between the two modes.
- **Activity Map dimensions** — populated from the `data.__adobe.analytics.contextData.a.activitymap.*`
  context data, **not** from `web.webInteraction`:
  - Activity Map Link ← `a.activitymap.link`
  - Activity Map Region ← `a.activitymap.region`
  - Activity Map Page ← `a.activitymap.page`

  Because Activity Map reads the context data, it reports **identically** in both modes — in
  Shape 1 the context data rides the click hit; in Shape 2 it rides the following page-view hit.

### `pageIDType` and the Activity Map Page dimension

`pageIDType` tells Analytics how to interpret `a.activitymap.page`:

- `1` = the value is a **page name** (`createStorePageViewProperties.js` stores `pageIDType: 1`
  with `webPageDetails.name` after a page view).
- `0` = the value is a **page URL** (`createGetClickedElementProperties.js` falls back to
  `window.location.href` with `pageIDType: 0` when no page name has been seen yet).

Name is preferred; URL is the fallback identifier, mirroring the
[Activity Map Page dimension](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/activity-map-page)
fallback ("if the Page dimension does not contain a value, the Page URL dimension is used").
Practical consequence: a click collected **before any page view has been recorded in the
session** carries `pageIDType: 0` and a URL as its Activity Map Page; once a page view has set
a name, subsequent clicks carry `pageIDType: 1` and the name.

### Classic AppMeasurement analogy

Shape 2 is the **direct equivalent of classic Activity Map behavior**: legacy AppMeasurement
appended `a.activitymap.*` context data to the *next* server call rather than sending its own
hit ([Activity Map Page dimension](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/activity-map-page):
"Activity Map data is typically sent on the next hit after a link was clicked"). Shape 1
(separate call per click) corresponds to *older* Web SDK behavior; enabling `eventGrouping`
restores the classic model.

---

## What happens when a click does **not** navigate?

This is the important edge case: a click that *does something on the page* (opens a modal,
toggles an accordion, triggers a JS action) without loading a new URL. The short answer
confirms the intuition — **event grouping will usually lose it, because grouping reports only
the last click before a page view, and an in-page click has no page view of its own.** But
the details matter, and *whether the click is collected at all* depends on the element.

### First: is the element even collected?

Automatic collection is anchor-centric. `findClickableElement.js` walks up from the clicked
node and only recognizes:

1. a supported **anchor** (`<a href>` / `<area href>`),
2. an element with an inline **`element.onclick`** DOM property,
3. an **`<input type="submit">`** or **`<button type="submit">`**.

Critically, `elementHasClickHandler` is literally `!!element.onclick`. **Handlers bound via
`addEventListener` or framework delegation (React/Vue/etc.) are not detected.** So the most
common modern in-page interaction — a `<button>` or `<div>` whose handler is attached by a
framework — is **never collected at all, in either mode**. No hit, no Activity Map data.
If you need those tracked, you must send them explicitly with `sendEvent` (see below).

### If it *is* collected but doesn't navigate

For a recognized element that stays on the page — an `<a>` that calls `preventDefault`, an
`onclick` button, a submit button that's handled client-side — the URL resolution
(`getAbsoluteUrlFromAnchorElement.js`) falls back to the **current page URL** when there's no
`href`. So it still qualifies as a valid, same-domain **internal link**. Then:

- **Immediate mode:** it is sent right away as its own `linkClicks` hit (with `URL` = the
  destination, or the current page for a non-anchor). **The in-page interaction is captured.**
- **Grouped mode:** it is written to storage and waits for the next page view — but *there is
  no navigation, so no page view follows*. The click sits in a **single-slot** store
  (`createClickActivityStorage.js` uses one key, `"clickData"`, and every grouped click
  **overwrites** it). The next click — typically the real navigation link — overwrites it, and
  only *that* click is flushed when the destination page view fires. **The in-page interaction
  is silently dropped.**

So with grouping, the store behaves as "remember only the most recent internal click," and the
flush is driven exclusively by page-view events (`index.js#onBeforeEvent` → `recallAndInject...`).
Your hypothesis is exactly right: the last click retained is the one that actually caused
navigation; earlier in-page clicks are clobbered.

**Worked timeline (grouping on):** user on a page clicks *Filter* (in-page, stored) → clicks
*Sort* (in-page, overwrites *Filter*) → clicks *Next Page* nav link (overwrites *Sort*) →
navigates → destination page view flushes **only *Next Page***. *Filter* and *Sort* never
reach reporting. Under immediate mode all three would be three Custom Link Instances.

### SPA nuance

In a single-page app, "page views" are virtual `sendEvent` calls the developer fires on route
changes. If an in-page click triggers a route change that you instrument as a page view, then
that click *is* the last click before the flush and **is** reported. A click that only mutates
UI with no subsequent page-view event is still lost. So under grouping, an in-page click is
reported **only if a page-view event fires before the next click** overwrites it.

### Storage-loss nuance (also affects real navigation)

Even for genuine navigation, grouping needs the stored click to survive until the destination
page view. With `sessionStorageEnabled: false` (the default), the click is held **in memory**,
which is destroyed by a full-page navigation — so on a classic multi-page site the navigation
click itself is lost. This is why Adobe recommends enabling `sessionStorageEnabled` alongside
grouping on non-SPA sites (SPAs don't unload, so in-memory is fine). See
[clickCollection](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/clickcollection).

### If you need in-page interactions in reporting

Send them explicitly — this bypasses click collection and grouping entirely and always
produces its own link hit (a Custom Link Instance + Activity Map data):

```js
alloy("sendEvent", {
  xdm: {
    eventType: "web.webinteraction.linkClicks",
    web: { webInteraction: { name: "Open filters", type: "other", linkClicks: { value: 1 } } }
  }
});
```

---

## Practical guidance

- **Want the fewest server calls and classic Activity-Map-on-next-page behavior?** Enable
  `eventGroupingEnabled` (and `sessionStorageEnabled` for non-SPA sites). Expect **Custom Link
  Instances to drop** for internal links; Page Views and Activity Map reporting are unaffected.
- **Rely on per-click "Instances" for internal links (funnels, link-level occurrence counts)?**
  Keep grouping **off**, or track those interactions with explicit `sendEvent` calls.
- **Exit and download link reporting is unchanged either way** — those clicks are always sent
  immediately and always register their own Instances/server calls; grouping only affects
  internal (`type: "other"`, same-domain) links.
- **In-page (non-navigating) interactions:** don't rely on auto-collection. Framework-bound
  handlers aren't detected, and grouping drops even the ones that are. Instrument them with
  explicit `sendEvent`.
- **Activity Map overlay extension** is not available for Web SDK implementations; the Activity
  Map *dimensions/reports* in Workspace still work. See
  [Activity Map overview](https://experienceleague.adobe.com/en/docs/analytics/analyze/activity-map/overview).

## Source references

- Alloy source: `packages/browser/src/components/ActivityCollector/` — `createClickedElementProperties.js`,
  `createInjectClickedElementProperties.js`, `createRecallAndInjectClickedElementProperties.js`,
  `createStorePageViewProperties.js`, `createClickActivityStorage.js`, `createGetClickedElementProperties.js`,
  `utils/dom/findClickableElement.js`, `utils/dom/elementHasClickHandler.js`, `utils/dom/getAbsoluteUrlFromAnchorElement.js`
- [Edge Network event types (hit-types)](https://experienceleague.adobe.com/en/docs/analytics/implementation/aep-edge/hit-types)
- [clickCollection / eventGrouping](https://experienceleague.adobe.com/en/docs/experience-platform/web-sdk/commands/configure/clickcollection)
- [Activity Map FAQ](https://experienceleague.adobe.com/en/docs/analytics/analyze/activity-map/faq) ·
  [Activity Map Page](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/activity-map-page) ·
  [Activity Map Link](https://experienceleague.adobe.com/en/docs/analytics/components/dimensions/activity-map-link)
- [`tl` method (link vs page view)](https://experienceleague.adobe.com/en/docs/analytics/implementation/vars/functions/tl-method)
- Internal AEP wiki: *AEP Web SDK ActivityMap Support* (`a.activitymap` DATA shape, `pageIDType`)

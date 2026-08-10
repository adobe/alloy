# @adobe/alloy-node

> [!WARNING]
> **Alpha. Only `configure`, `sendEvent`, Identity's commands, and
> fetch-only Personalization are exercised so far.** Most optional
> components (Consent, Audiences, etc.) are not wired up yet.

Node.js entrypoint for the Adobe Experience Platform Web SDK.

```js
import { createInstance } from "@adobe/alloy-node";

const alloy = createInstance();
await alloy.configure({
  orgId: "...",
  datastreamId: "...",
});
await alloy.sendEvent({ xdm: { eventType: "..." } });
```

Unlike the browser bundle's `alloy("commandName", options)` calling
convention, `createInstance`/`createCustomInstance` return an object with
real methods (`configure`, `sendEvent`, `getIdentity`,
`appendIdentityToUrl`, `applyResponse`, `getLibraryInfo`, `setDebug`). The
browser bundle uses a callable string-command dispatcher so a synchronous
stub can queue calls before the library finishes loading asynchronously —
that doesn't apply in Node, so methods are used instead for discoverability.

## One instance per process, `forRequest()` per request

Call `configure()` once, when your server starts — the same way you'd
configure once per page load in the browser. Node has no equivalent of a
page load resetting everything between visitors, though, so a real server
needs a way to resolve _this request's_ visitor identity without recreating
or reconfiguring the whole instance. That's what `forRequest()` is for:

```js
const alloy = createInstance();
await alloy.configure({ orgId: "...", datastreamId: "..." });

// Per request:
app.get("/", async (req, res) => {
  const request = alloy.forRequest({
    cookie: createCookieServiceForThisRequest(req, res),
  });
  const result = await request.sendEvent({ xdm: { eventType: "..." } });
  // ...
});
```

`forRequest()` returns a bound handle with the same methods (minus
`configure`, since it's already configured) backed by its own instance,
reconfigured under the hood with the same config plus your request-scoped
`cookie` override. Two requests that share a cookie store (i.e. the same
visitor, cookies read from their real `Cookie` header) resolve to the same
identity; requests that don't share one get independent identities — no
server-side session cache required, since the continuity lives in the
cookie itself, the same way it already does across browser page loads.

## Hybrid personalization

`createInstance()` includes a fetch-only Personalization component: pass
`decisionScopes` or `personalization.surfaces`/`personalization.decisionScopes`
to `sendEvent()` and the result includes a `propositions` array — the same
shape the browser SDK's `applyPropositions` command expects:

```js
const { propositions } = await request.sendEvent({
  xdm: { eventType: "decisioning.propositionFetch" },
  personalization: { surfaces: ["web://example.com/"] },
});
// Serialize `propositions` into the page, then client-side:
// alloy("applyPropositions", { propositions });
```

There's no rendering here — no DOM actions, view cache, click tracking, or
display-notification batching, since there's no page to render into in
Node. That's the client's job once it calls `applyPropositions`; use
`createCustomInstance({ components: [] })` to omit this component entirely.

## Platform services

Both `createInstance(options)` and `forRequest(overrides)` accept a
`platformServices`-shaped object (flat on `forRequest`, nested under
`platformServices` on `createInstance`) to override any of the default
in-memory Node services (`network`, `storage`, `cookie`, `runtime`,
`legacy`, `globals`) with your own implementation:

```js
const alloy = createInstance({
  platformServices: {
    cookie: createDefaultCookieService(),
  },
});
```

`cookie` is the one you'll reach for most — the default is an in-memory jar,
so identity resets whenever it's the only thing available (e.g. on the
top-level instance, if you never call `forRequest()`). Overrides must
implement the `CookieService` interface (`get`, `getAll`, `set`, `remove`,
`withConverter`) documented in `@adobe/alloy-core/services`.

### What's visitor-scoped vs. process-scoped

Everything ECID/identity-related — the `kndctr_`/`AMCV_` cookies, edge
cluster/location-hint affinity, consent cookies forwarded to the Edge
Network — goes through `cookie`, so it's already correctly bucketed by
`forRequest()`'s per-request override. `storage`'s current uses (debug-flag
persistence, an Assurance validation client ID) are process-level
bookkeeping, not visitor state, _except_ that Assurance client ID: it's
meant to be a stable per-visitor value, but with the default in-memory
`storage` it resets every request unless you also pass a `storage` override
to `forRequest()`, the same way you would `cookie`.

If a future component needs to persist visitor-scoped state beyond a single
request (e.g. decisioning event history for content-card/frequency-capping
dedup, à la the browser's `personalizationStorageEnabled` — not implemented
in Node yet), it should read/write that through `platformServices.storage`
and rely on the same `forRequest({ storage: ... })` override mechanism,
not a new one.

# @adobe/alloy-node

> [!WARNING]
> **Alpha. Only `configure`, `sendEvent`, Identity's commands, Consent, a
> minimal Context, and fetch-only Personalization are exercised so far.**
> Most other optional components (Audiences, RulesEngine, etc.) are not
> wired up yet.

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
`appendIdentityToUrl`, `applyResponse`, `getLibraryInfo`, `setDebug`,
`setConsent`). The browser bundle uses a callable string-command dispatcher
so a synchronous stub can queue calls before the library finishes loading
asynchronously — that doesn't apply in Node, so methods are used instead for
discoverability.

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

## Consent

`createInstance()` includes Consent, so `setConsent` is available the same
way it is in the browser — call it per-request, on the `forRequest()` handle,
with whatever consent value the visitor already recorded in their browser:

```js
await request.setConsent({
  consent: [{ standard: "Adobe", version: "1.0", value: { general: "in" } }],
});
```

Like identity, consent state is tied to the visitor's cookies (read/written
through `platformServices.cookie`), so it's automatically scoped correctly
by whatever `cookie` override you already pass to `forRequest()` — no
separate wiring needed. If you build a custom instance with
`createCustomInstance({ components: [...] })` and leave `consent` out,
`setConsent` will still exist as a method but will reject when called, the
same as calling an unregistered command in the browser bundle.

> [!WARNING]
> `defaultConsent: "pending"` is rejected by `configure()` — not supported
> in Node. A pending `sendEvent()`/`getIdentity()` on one `forRequest()`
> call can only ever be released by a `setConsent()` on that *exact same*
> call, never by a later request for the same visitor (each `forRequest()`
> is a fresh instance with its own private pending queue) — unlike a
> browser page, Node has no equivalent long-lived session to hold that
> state across separate HTTP requests. Use `"in"` or `"out"`, and gate
> calling `sendEvent()`/`setConsent()` on your own persisted consent
> decision instead. If you need the multi-request pending flow to work,
> let us know — we haven't built it because we don't yet have signal that
> anyone needs it, not because it's impossible.

## Context

A minimal, always-on Context component attaches `implementationDetails` to
every event automatically. There's no DOM to read device/viewport/timezone
info from like the browser version does, but if you pass the real incoming
request to `forRequest({ request })`, Context also derives
`web.webPageDetails.URL` from its `Referer` header, and the visitor's real
headers (`User-Agent`, client hints, `X-Forwarded-For`, etc. — see
`pickForwardableHeaders`) get forwarded upstream to Edge Network, so its own
server-side device/locale/geo parsing has real data to work with instead of
whatever Node's own `fetch()` would send by default:

```js
const request = alloy.forRequest({
  cookie: createCookieServiceForThisRequest(req, res),
  request: req, // any { headers } object — a raw request, Express req, etc.
});
```

Everything else the browser's Context collects (screen size, viewport,
local timezone) has no honest server-side source and isn't guessed at here —
merge real values directly via `sendEvent({ xdm: { ... } })` if you have
them.

## Authenticated requests (Edge Network Server API, v2)

Because Node runs in a trusted, client-controlled environment (unlike a
browser), it authenticates its own requests instead of sending them
unauthenticated — `configure()` **requires** OAuth Server-to-Server
credentials from the [Adobe Developer Console](https://developer.adobe.com/console):

```js
await alloy.configure({
  orgId: "...",
  datastreamId: "...",
  edgeCredentials: {
    clientId: "...",
    clientSecret: "...",
    scopes: ["openid", "AdobeID", ...], // whatever your project grants
  },
});
```

`configure()` rejects if `edgeCredentials` is missing — unlike the browser
bundle, where the same config field is optional (and generally shouldn't be
used at all: shipping a client secret to a browser defeats the point of it
being a secret). `sendEvent()` then goes to the authenticated Edge Network
Server API (`server.adobedc.net`, `v2`) instead of the standard one, with a
real IMS access token attached.

> [!TIP]
> Don't have a Developer Console project yet? Pass
> `edgeCredentials: { clientId: "TEST", clientSecret: "TEST" }` to
> quickstart against the standard unauthenticated v1 API instead — it
> satisfies the required-`edgeCredentials` check but is discarded rather
> than used, so no real IMS authentication is attempted. For local
> exploration and tests only; don't ship this to production.

The IMS token is fetched once and cached (~24h) for the life of the
process, not once per request — it's server-credential state, not visitor
state, shared automatically across every `forRequest()` call the same way
`network`/`runtime` already are.

Verified against a real, credentialed project — two things worth knowing,
neither of which needs any code changes on your part, but do affect what
you pass to `sendEvent()`:

- **Only `sendEvent` uses v2.** `setConsent` and `getIdentity` still go
  through the standard v1 endpoint even when `edgeCredentials` is
  configured — the authenticated Server API returns a flat 404 for
  `privacy/set-consent` and `identity/acquire`. This is handled
  automatically; you don't need to do anything differently for those
  calls.
- **You must supply a primary identity.** Since there's no browser cookie
  jar for Edge Network to resolve identity from on a pure server-to-server
  call, an authenticated `sendEvent()` needs an explicit identity in the
  event itself, or it's rejected:

  ```js
  await request.sendEvent({
    xdm: {
      eventType: "...",
      identityMap: {
        Email: [{ id: "visitor@example.com", primary: true }],
      },
    },
  });
  ```

  (The `events` → `event` payload reshaping v2 requires under the hood is
  handled internally — nothing to do there either.)

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
`forRequest()`'s per-request override. `request` (the real incoming HTTP
request, see [Context](#context)) is inherently per-request too, and is
never inherited from the top-level instance the way `cookie`/`storage`
aren't. `storage`'s current uses (debug-flag
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

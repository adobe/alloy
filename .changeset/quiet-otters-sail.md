---
"@adobe/alloy-node": minor
"@adobe/alloy-core": minor
---

Fixed `getLibraryInfo()` returning the literal, unreplaced `"__VERSION__"` build placeholder in Node (it now reports `@adobe/alloy-node`'s own version, the same way `implementationDetails.version` already did).

Added `edgeCredentials` (OAuth Server-to-Server) to `configure()`. When present, `sendEvent()` authenticates against the Edge Network Server API (v2) instead of the standard unauthenticated endpoint — verified against a real credentialed project. `setConsent`/`getIdentity` continue to use the standard v1 endpoint regardless, since the Server API has no v2 equivalent for those actions. An authenticated `sendEvent()` requires an explicit primary identity in the event (`xdm.identityMap`), since there's no browser cookie for Edge Network to resolve identity from server-to-server.

In `@adobe/alloy-node`, `edgeCredentials` is **required**, not optional — Node runs in a trusted, client-controlled environment, so `configure()` rejects if it's missing rather than falling back to the unauthenticated v1 endpoint. (It remains optional, and generally inadvisable, in the browser bundle, where shipping a client secret defeats the point of it being a secret.)

`@adobe/alloy-node`'s `configure()` also now rejects `defaultConsent: "pending"`. Node has no equivalent of a browser page's lifetime to hold a pending consent decision across separate HTTP requests — a pending `sendEvent()`/`getIdentity()` on one `forRequest()` call could only ever be released by a `setConsent()` on that exact same call, never by a later request for the same visitor, which was a footgun rather than a usable feature. Use `"in"` or `"out"`, and gate calling `sendEvent()`/`setConsent()` on your own persisted consent decision instead.

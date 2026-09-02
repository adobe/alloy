---
"@adobe/alloy-node": minor
"@adobe/alloy-core": patch
---

Added Consent and a minimal Context component to the Node SDK. `setConsent` is now available (scoped per-visitor), and every event now carries `implementationDetails`. `forRequest({ request })` accepts the real incoming HTTP request to forward the visitor's `User-Agent`/`Accept-Language` headers to Edge Network and derive `web.webPageDetails.URL` from the `Referer` header.

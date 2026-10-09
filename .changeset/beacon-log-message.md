---
"@adobe/alloy-core": patch
"@adobe/alloy": patch
---

Requests sent with `sendBeacon` (for example, `sendEvent` with `documentUnloading: true`) no longer log "Received response with status code 204". The browser gives no response for `sendBeacon` requests, so the debug log now says the request was sent using `sendBeacon`, that no response is available, and that browser developer tools may show it as canceled if the page navigates away.

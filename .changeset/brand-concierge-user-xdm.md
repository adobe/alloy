---
"@adobe/alloy-core": patch
---

Fixed `sendConversationEvent` replacing XDM fields you pass, such as `timestamp`, with the values Web SDK collects automatically. As with `sendEvent`, the XDM you pass now takes precedence.

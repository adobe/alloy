---
"@adobe/alloy": minor
---

Added a `serverSideTimestamp` option to the `context` configuration. It is off by default. When you add it to `context`, Web SDK sends `xdm.timestamp` as `null` instead of the client clock time, and Edge Network stamps each event with its own time. Use it when your visitors' device clocks are unreliable. A timestamp you set yourself, in `sendEvent` XDM or in `onBeforeEventSend`, is still sent as is.

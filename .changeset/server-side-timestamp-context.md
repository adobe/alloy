---
"@adobe/alloy": minor
"@adobe/alloy-core": minor
---

Added a `serverSideTimestamp` option to the `context` configuration. It is off by default. When you add it to `context`, Web SDK leaves `xdm.timestamp` out of the events it sends to Edge Network, and Edge Network stamps each event with its own time. Use it when your visitors' device clocks are unreliable. This applies to `sendEvent`, link clicks, personalization notifications, media session starts, advertising conversions, and push notification tracking. Media events sent after the session starts keep the device time, because the media endpoint requires it. A timestamp you set yourself, in the XDM you pass or in `onBeforeEventSend`, is still sent as is.

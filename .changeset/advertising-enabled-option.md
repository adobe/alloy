---
"@adobe/alloy": minor
---

Added an `advertising.enabled` configuration option. It is `true` by default. Set it to `false` to turn off the Advertising component at runtime without removing it from your build: Web SDK then sends no click-through or view-through conversions, adds no advertising IDs to events (even when `handleAdvertisingData` is `"auto"` or `"wait"`), loads no advertising scripts or iframes, and leaves advertising cookies alone. The value must be a boolean.

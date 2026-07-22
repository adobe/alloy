---
"@adobe/alloy": patch
---

Fix Push Notifications module so the ECID used to target notifications is persisted reliably: skip sending when no ECID is available, and only cache the subscription details after the ECID is saved so a failed send or storage write self-heals on the next attempt.

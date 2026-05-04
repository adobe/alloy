---
"@adobe/alloy-core": patch
---

Skip advertising identity resolution (Surfer ID, ID5, RampID) on `sendEvent` when no enabled `advertiserSettings` are configured. Previously, every event would load third-party scripts and inject iframes even when there was no advertiser to stitch identities to.

---
"@adobe/alloy-core": minor
"@adobe/alloy": minor
---

Brand Concierge voice requests (`voiceEnabled: true`) now honor the `conversation.region` configuration, routing to `/brand-concierge-voice/<region>` the same way text requests route to `/brand-concierge/<region>`. When no region is configured, voice requests continue to use `/brand-concierge-voice`.

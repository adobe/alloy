---
"@adobe/alloy-core": patch
---

Always forward the Marketo Munchkin cookie (`_mkto_trk`) to the Edge Network by adding it to the cookie-transfer allowlist, so the server can resolve the visitor's Marketo identity. Additionally, Brand Concierge gains a `conversation.transferCookies` configuration option for forwarding extra first-party cookies into the conversation request `meta.state`.

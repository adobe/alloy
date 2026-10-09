---
"@adobe/alloy-core": patch
"@adobe/alloy": patch
---

Events sent with `documentUnloading: true` that still go to the `interact` endpoint with `fetch` (for example, before an identity has been established) now use `keepalive`, so the browser finishes the request even if the page navigates away. If the browser refuses the `keepalive` request because the page's in-flight `keepalive` data would exceed 64 KiB, the request is retried as a regular `fetch`.

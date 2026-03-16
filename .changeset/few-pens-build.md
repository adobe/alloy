---
"@adobe/alloy": patch
---

Added a fix so that we keep the sessionId in memory when session sticky is false.

This will allow users to run different sessions in different tabs.

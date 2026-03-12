---
"@adobe/alloy": patch
---

Added support for `voiceEnabled` option on the `sendConversationEvent` command so the SDK routes requests to the voice subpath on a per-call basis. Included unit test coverage for option validation and voice subpath routing behavior.

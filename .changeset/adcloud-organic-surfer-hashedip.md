---
"@adobe/alloy": minor
---

Added support for Advertising organic events: SurferID and hashed client IP are now collected via the everesttech.net pixel and appended to outgoing Experience Events as `_experience.adcloud.stitchId` (XDM) and `query.advertising.stitchIds` (query). A shared iframe call ensures the pixel is loaded only once per page.

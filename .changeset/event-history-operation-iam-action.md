---
"@adobe/alloy-core": patch
---

Fixed event history operations from Adobe Journey Optimizer dropping the `iam.action` field. Inserted events now include the action, so they are recorded in the same event history entry as the matching Web SDK interaction (for example, an in-app message `clicked` interaction) and can be counted by historical rule conditions that filter on an action.

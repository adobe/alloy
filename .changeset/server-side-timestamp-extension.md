---
"reactor-extension-alloy": minor
---

Added a "Use server-side timestamp" checkbox to the context options in the extension configuration. It is off by default. When you check it, Web SDK leaves `xdm.timestamp` out of the events it sends to Edge Network, and Edge Network stamps each event with its own time instead of the visitor's device clock. To see the checkbox, select "Specific context information".

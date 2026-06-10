---
"reactor-extension-alloy": minor
---

Added a "Property actions" section to the extension configuration view with a "Repair stale data element references" button. The button scans every action in the current property that belongs to this extension and repairs any reference to a data element that no longer exists on the property by matching on the saved data element name. Progress is reported in a dialog that can be hidden (the operation continues) and reopened; results are surfaced as a summary with per-action detail for anything that could not be repaired automatically.

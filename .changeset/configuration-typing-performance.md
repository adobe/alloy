---
"reactor-extension-alloy": patch
---

Fixed slow typing in the extension configuration. Each keystroke used to re-render the whole form, which took around 150–250ms. Fields now update on their own, and typed text in configuration fields is saved when the field loses focus.

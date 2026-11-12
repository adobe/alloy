---
"reactor-extension-alloy": patch
---

Fixed slow typing in the extension views. Each keystroke used to re-render the whole form, taking roughly 140–210ms in the extension configuration; fields now update on their own, at around 8–15ms per keystroke. Validation errors in lists, such as metadata and header rows, now appear on the row that caused them.

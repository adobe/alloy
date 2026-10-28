---
"reactor-extension-alloy": minor
---

Fixed Staging and Development datastream fields disappearing from the extension configuration when their saved sandbox was missing or no longer available.

Each environment now always shows a single datastream field, replacing the "Choose from list" and "Enter values" options and the sandbox pickers. In this field you can choose a datastream from any sandbox you have access to (grouped by sandbox and searchable by name or ID), type a datastream ID, or select a data element. Datastream overrides in actions use the same field.

Saved datastream IDs and data elements are kept as entered. When a saved datastream is found, its sandbox is filled in or corrected automatically. Datastream overrides no longer save which input method was used.

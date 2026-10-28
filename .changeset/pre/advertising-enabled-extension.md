---
"reactor-extension-alloy": minor
---

Added an "Advertising" field to the top of the Adobe Advertising section of the extension configuration. Choose Enabled (the default), Disabled, or a data element that returns `true` or `false`. Disabled turns off the Advertising component at runtime using the Web SDK `advertising.enabled` option, without removing it from your build, and hides the other advertising fields. To remove the advertising code from the library instead, uncheck Advertising under Build options.

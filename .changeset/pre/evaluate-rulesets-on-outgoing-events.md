---
"@adobe/alloy-core": patch
---

Rulesets are now evaluated against outgoing events that do not request personalization, such as content card display, interact and dismiss notifications, and event history operations from matching rules are recorded. For example, Adobe Journey Optimizer's "disqualify on dismiss" rule now records the dismissal, so a dismissed content card stays hidden without calling `evaluateRulesets` manually.

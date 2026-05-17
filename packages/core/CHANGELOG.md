# @adobe/alloy-core

## 1.2.0-beta.0

### Minor Changes

- [#1504](https://github.com/adobe/alloy/pull/1504) [`676b653`](https://github.com/adobe/alloy/commit/676b6535c7a17ef5879d2abff539ba721fc61bc7) Thanks [@ninaceban](https://github.com/ninaceban)! - Added `region` configuration option to the Brand Concierge component. When set, the region is used to route conversation requests to a specific Adobe edge node (e.g. `va7`, `or2`, `irl1`). The Tags extension UI now includes a Region field in the Brand Concierge configuration section.

## 1.1.2

### Patch Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Advertising: emit `_experience.adcloud.stitchId` on outgoing Experience Events containing SurferID and hashed client IP address

- [#1486](https://github.com/adobe/alloy/pull/1486) [`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Move browser-specific components (Personalization, Context, Advertising, PushNotifications) from core package to browser package

- [#1489](https://github.com/adobe/alloy/pull/1489) [`259138e`](https://github.com/adobe/alloy/commit/259138eb8743c8a22b60722ceafee7d1aabdb6d5) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added enhancements for detecting and decoding adobe_mc in the URI

- [#1480](https://github.com/adobe/alloy/pull/1480) [`2760287`](https://github.com/adobe/alloy/commit/2760287005308260fe3b5da83a6ce4f8ef6d6635) Thanks [@ninaceban](https://github.com/ninaceban)! - Include XDM in all Brand Concierge events

- [#1491](https://github.com/adobe/alloy/pull/1491) [`f2a616c`](https://github.com/adobe/alloy/commit/f2a616cfcaaf44020cba6ecb6b623d66ef305017) Thanks [@adhir111](https://github.com/adhir111)! - Skip advertising identity resolution (Surfer ID, ID5, RampID) on `sendEvent` when no enabled `advertiserSettings` are configured. Previously, every event would load third-party scripts and inject iframes even when there was no advertiser to stitch identities to.

- [#1475](https://github.com/adobe/alloy/pull/1475) [`50307a9`](https://github.com/adobe/alloy/commit/50307a9e41ff0173a08b1d52e5ad8fea2f53454d) Thanks [@carterworks](https://github.com/carterworks)! - Improve send event performance by removing identity destination completion hold

## 1.1.2-beta.3

### Patch Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Advertising: emit `_experience.adcloud.stitchId` on outgoing Experience Events containing SurferID and hashed client IP address

## 1.1.2-beta.2

### Patch Changes

- [#1486](https://github.com/adobe/alloy/pull/1486) [`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Move browser-specific components (Personalization, Context, Advertising, PushNotifications) from core package to browser package

- [#1489](https://github.com/adobe/alloy/pull/1489) [`259138e`](https://github.com/adobe/alloy/commit/259138eb8743c8a22b60722ceafee7d1aabdb6d5) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added enhancements for detecting and decoding adobe_mc in the URI

- [#1491](https://github.com/adobe/alloy/pull/1491) [`f2a616c`](https://github.com/adobe/alloy/commit/f2a616cfcaaf44020cba6ecb6b623d66ef305017) Thanks [@adhir111](https://github.com/adhir111)! - Skip advertising identity resolution (Surfer ID, ID5, RampID) on `sendEvent` when no enabled `advertiserSettings` are configured. Previously, every event would load third-party scripts and inject iframes even when there was no advertiser to stitch identities to.

## 1.1.2-beta.1

### Patch Changes

- 2760287: Include XDM in all Brand Concierge events

## 1.1.2-beta.0

### Patch Changes

- 50307a9: Improve send event performance by removing identity destination completion hold

## 1.1.1

### Patch Changes

- f225f28: Create `@adobe/alloy-core` npm package

## 1.1.1-beta.0

### Patch Changes

- f225f28: Create `@adobe/alloy-core` npm package

## 1.1.0

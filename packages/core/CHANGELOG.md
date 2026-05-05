# @adobe/alloy-core

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

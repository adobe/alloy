# @adobe/alloy-node

## 1.0.0

### Major Changes

- [#1561](https://github.com/adobe/alloy/pull/1561) [`7ac18dc`](https://github.com/adobe/alloy/commit/7ac18dc37a1d42b88a7521bc0fa6c88ea0bfb82c) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Created MVP for node package

### Minor Changes

- [#1564](https://github.com/adobe/alloy/pull/1564) [`34fab83`](https://github.com/adobe/alloy/commit/34fab83b4aa76fc7c1c023c47a1bd5a7f968082d) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added Consent and a minimal Context component to the Node SDK. `setConsent` is now available (scoped per-visitor), and every event now carries `implementationDetails`. `forRequest({ request })` accepts the real incoming HTTP request to forward the visitor's `User-Agent`/`Accept-Language` headers to Edge Network and derive `web.webPageDetails.URL` from the `Referer` header.

### Patch Changes

- Updated dependencies [[`7ac18dc`](https://github.com/adobe/alloy/commit/7ac18dc37a1d42b88a7521bc0fa6c88ea0bfb82c), [`80257dc`](https://github.com/adobe/alloy/commit/80257dcb4f313cd602126371e448d1648507805a), [`34fab83`](https://github.com/adobe/alloy/commit/34fab83b4aa76fc7c1c023c47a1bd5a7f968082d)]:
  - @adobe/alloy-core@1.2.3

## 0.1.0-beta.1

### Minor Changes

- [#1564](https://github.com/adobe/alloy/pull/1564) [`34fab83`](https://github.com/adobe/alloy/commit/34fab83b4aa76fc7c1c023c47a1bd5a7f968082d) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added Consent and a minimal Context component to the Node SDK. `setConsent` is now available (scoped per-visitor), and every event now carries `implementationDetails`. `forRequest({ request })` accepts the real incoming HTTP request to forward the visitor's `User-Agent`/`Accept-Language` headers to Edge Network and derive `web.webPageDetails.URL` from the `Referer` header.

### Patch Changes

- Updated dependencies [[`34fab83`](https://github.com/adobe/alloy/commit/34fab83b4aa76fc7c1c023c47a1bd5a7f968082d)]:
  - @adobe/alloy-core@1.2.3-beta.2

## 1.0.0-beta.0

### Major Changes

- [#1561](https://github.com/adobe/alloy/pull/1561) [`7ac18dc`](https://github.com/adobe/alloy/commit/7ac18dc37a1d42b88a7521bc0fa6c88ea0bfb82c) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Created MVP for node package

### Patch Changes

- Updated dependencies [[`7ac18dc`](https://github.com/adobe/alloy/commit/7ac18dc37a1d42b88a7521bc0fa6c88ea0bfb82c)]:
  - @adobe/alloy-core@1.2.3-beta.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`f72ec8f`](https://github.com/adobe/alloy/commit/f72ec8f8380474fb4e4acf0b9856645a7a1efc80), [`3d5faef`](https://github.com/adobe/alloy/commit/3d5faef53f88eb19ac6b87d13e699addb7978c15)]:
  - @adobe/alloy-core@1.2.2

## 0.0.3-beta.0

### Patch Changes

- Updated dependencies [[`3d5faef`](https://github.com/adobe/alloy/commit/3d5faef53f88eb19ac6b87d13e699addb7978c15)]:
  - @adobe/alloy-core@1.2.2-beta.0

## 0.0.2

### Patch Changes

- Updated dependencies [[`7c15a87`](https://github.com/adobe/alloy/commit/7c15a87b4fc252d10e3f0e3b79b8bf2f87472af6), [`109e2c4`](https://github.com/adobe/alloy/commit/109e2c4975e9eb35e11a9c0f21f402690eb1408d)]:
  - @adobe/alloy-core@1.2.1

## 0.0.2-beta.0

### Patch Changes

- Updated dependencies [[`7c15a87`](https://github.com/adobe/alloy/commit/7c15a87b4fc252d10e3f0e3b79b8bf2f87472af6)]:
  - @adobe/alloy-core@1.2.1-beta.0

## 0.0.1

### Patch Changes

- Updated dependencies [[`543a0e9`](https://github.com/adobe/alloy/commit/543a0e9f7ddbcd0a79885dfba8e0539a8bcf4cf4), [`676b653`](https://github.com/adobe/alloy/commit/676b6535c7a17ef5879d2abff539ba721fc61bc7), [`44042df`](https://github.com/adobe/alloy/commit/44042df84fd4c003567e64aa3d03f6c94c33e094), [`601b4a8`](https://github.com/adobe/alloy/commit/601b4a8dcb964880fe7da518484a301891cabced)]:
  - @adobe/alloy-core@1.2.0

## 0.0.1-beta.0

### Patch Changes

- Updated dependencies [[`676b653`](https://github.com/adobe/alloy/commit/676b6535c7a17ef5879d2abff539ba721fc61bc7)]:
  - @adobe/alloy-core@1.2.0-beta.0

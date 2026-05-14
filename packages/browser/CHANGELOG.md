# @adobe/alloy

## 2.34.0-beta.0

### Minor Changes

- [#1504](https://github.com/adobe/alloy/pull/1504) [`676b653`](https://github.com/adobe/alloy/commit/676b6535c7a17ef5879d2abff539ba721fc61bc7) Thanks [@ninaceban](https://github.com/ninaceban)! - Added `region` configuration option to the Brand Concierge component. When set, the region is used to route conversation requests to a specific Adobe edge node (e.g. `va7`, `or2`, `irl1`). The Tags extension UI now includes a Region field in the Brand Concierge configuration section.

### Patch Changes

- Updated dependencies [[`676b653`](https://github.com/adobe/alloy/commit/676b6535c7a17ef5879d2abff539ba721fc61bc7)]:
  - @adobe/alloy-core@1.2.0-beta.0

## 2.33.1

### Patch Changes

- [#1500](https://github.com/adobe/alloy/pull/1500) [`6b0e6d1`](https://github.com/adobe/alloy/commit/6b0e6d16243c4a975794660279b729aa553b2196) Thanks [@carterworks](https://github.com/carterworks)! - Fixed an issue where the Context component was being excluded in certain environments

## 2.33.1-beta.0

### Patch Changes

- [#1500](https://github.com/adobe/alloy/pull/1500) [`6b0e6d1`](https://github.com/adobe/alloy/commit/6b0e6d16243c4a975794660279b729aa553b2196) Thanks [@carterworks](https://github.com/carterworks)! - Fixed an issue where the Context component was being excluded in certain environments

## 2.33.0

### Minor Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Added support for Advertising organic events: SurferID and hashed client IP are now collected via the everesttech.net pixel and appended to outgoing Experience Events as `_experience.adcloud.stitchId` (XDM) and `query.advertising.stitchIds` (query). A shared iframe call ensures the pixel is loaded only once per page.

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Added support for Advertising organic events: All organic events are now attached with Advertising ids (SurferId and HashedIP) in the schema \_experience->adcloud->stitchId.

### Patch Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Advertising: emit `_experience.adcloud.stitchId` on outgoing Experience Events containing SurferID and hashed client IP address

- [#1476](https://github.com/adobe/alloy/pull/1476) [`92b0ffd`](https://github.com/adobe/alloy/commit/92b0ffd12dda580ebcfa0575d412bbcf205957be) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Fix param ordering for 3 media analytics bridge methods

- [#1486](https://github.com/adobe/alloy/pull/1486) [`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Move browser-specific components (Personalization, Context, Advertising, PushNotifications) from core package to browser package

- [#1494](https://github.com/adobe/alloy/pull/1494) [`447f851`](https://github.com/adobe/alloy/commit/447f851aa09789deaeddc37516ac080fdbc49908) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Register required components (eg context) in browser package

- Updated dependencies [[`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063), [`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4), [`259138e`](https://github.com/adobe/alloy/commit/259138eb8743c8a22b60722ceafee7d1aabdb6d5), [`2760287`](https://github.com/adobe/alloy/commit/2760287005308260fe3b5da83a6ce4f8ef6d6635), [`f2a616c`](https://github.com/adobe/alloy/commit/f2a616cfcaaf44020cba6ecb6b623d66ef305017), [`50307a9`](https://github.com/adobe/alloy/commit/50307a9e41ff0173a08b1d52e5ad8fea2f53454d)]:
  - @adobe/alloy-core@1.1.2

## 2.33.0-beta.2

### Minor Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Added support for Advertising organic events: SurferID and hashed client IP are now collected via the everesttech.net pixel and appended to outgoing Experience Events as `_experience.adcloud.stitchId` (XDM) and `query.advertising.stitchIds` (query). A shared iframe call ensures the pixel is loaded only once per page.

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Added support for Advertising organic events: All organic events are now attached with Advertising ids (SurferId and HashedIP) in the schema \_experience->adcloud->stitchId.

### Patch Changes

- [#1487](https://github.com/adobe/alloy/pull/1487) [`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063) Thanks [@ksakhare2021](https://github.com/ksakhare2021)! - Advertising: emit `_experience.adcloud.stitchId` on outgoing Experience Events containing SurferID and hashed client IP address

- Updated dependencies [[`e271e7a`](https://github.com/adobe/alloy/commit/e271e7aaab319a711465d7728503e7f3cd399063)]:
  - @adobe/alloy-core@1.1.2-beta.3

## 2.32.1-beta.1

### Patch Changes

- [#1476](https://github.com/adobe/alloy/pull/1476) [`92b0ffd`](https://github.com/adobe/alloy/commit/92b0ffd12dda580ebcfa0575d412bbcf205957be) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Fix param ordering for 3 media analytics bridge methods

- [#1486](https://github.com/adobe/alloy/pull/1486) [`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Move browser-specific components (Personalization, Context, Advertising, PushNotifications) from core package to browser package

- [#1494](https://github.com/adobe/alloy/pull/1494) [`447f851`](https://github.com/adobe/alloy/commit/447f851aa09789deaeddc37516ac080fdbc49908) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Register required components (eg context) in browser package

- Updated dependencies [[`e120399`](https://github.com/adobe/alloy/commit/e12039919c68cd8479e7901e06896272e1f41cc4), [`259138e`](https://github.com/adobe/alloy/commit/259138eb8743c8a22b60722ceafee7d1aabdb6d5), [`f2a616c`](https://github.com/adobe/alloy/commit/f2a616cfcaaf44020cba6ecb6b623d66ef305017)]:
  - @adobe/alloy-core@1.1.2-beta.2

## 2.32.1-beta.0

### Patch Changes

- Updated dependencies [50307a9]
  - @adobe/alloy-core@1.1.2-beta.0

## 2.32.0

### Minor Changes

- f225f28: Create `@adobe/alloy-core` npm package

### Patch Changes

- 3e22bcc: Added a fix so that we keep the sessionId in memory when session sticky is false.

  This will allow users to run different sessions in different tabs.

- 9db9ef5: Added support for `voiceEnabled` option on the `sendConversationEvent` command so the SDK routes requests to the voice subpath on a per-call basis. Included unit test coverage for option validation and voice subpath routing behavior.
- 633f566: Include IANA timezone on the place context
- 00d1187: Add configuration to Brand Concierge, to enable or disable sources data collection.
- 292bb30: Force a patch version
- 366cc96: fixed a packaging issue where certain consumers of the NPM package were unable to use packaged utility functions.
- Updated dependencies [f225f28]
  - @adobe/alloy-core@1.1.1

## 2.32.0-beta.3

### Minor Changes

- f225f28: Create `@adobe/alloy-core` npm package

### Patch Changes

- Updated dependencies [f225f28]
  - @adobe/alloy-core@1.1.1-beta.0

## 2.31.2-beta.2

### Patch Changes

- 292bb30: Force a patch version

## 2.31.2-beta.1

### Patch Changes

- 9db9ef5: Added support for `voiceEnabled` option on the `sendConversationEvent` command so the SDK routes requests to the voice subpath on a per-call basis. Included unit test coverage for option validation and voice subpath routing behavior.

## 2.31.2-beta.0

### Patch Changes

- 3e22bcc: Added a fix so that we keep the sessionId in memory when session sticky is false.

  This will allow users to run different sessions in different tabs.

- 633f566: Include IANA timezone on the place context
- 00d1187: Add configuration to Brand Concierge, to enable or disable sources data collection.

## 2.31.1

### Patch Changes

- [#1442](https://github.com/adobe/alloy/pull/1442) [`e27bf44`](https://github.com/adobe/alloy/commit/e27bf44310fc161c05bd22e7ac3aa0100a5b600d) Thanks [@adhir111](https://github.com/adhir111)! - Added consent gating to the Advertising component to ensure no advertising cookies are written before user consent is resolved.

- [#1443](https://github.com/adobe/alloy/pull/1443) [`5e5b811`](https://github.com/adobe/alloy/commit/5e5b811e02e449e5c3ab82824be0f26a23c14172) Thanks [@carterworks](https://github.com/carterworks)! - Fixed an issue where there are multiple s_kwcid or ef_id parameters in url"

- [#1444](https://github.com/adobe/alloy/pull/1444) [`98cdde5`](https://github.com/adobe/alloy/commit/98cdde510de22e46946261e7dd17ea67921a9ab6) Thanks [@ninaceban](https://github.com/ninaceban)! - Fixed a bug where in Safari the Brand Concierge streams were not parsed

## 2.31.1-beta.2

### Patch Changes

- [#1443](https://github.com/adobe/alloy/pull/1443) [`5e5b811`](https://github.com/adobe/alloy/commit/5e5b811e02e449e5c3ab82824be0f26a23c14172) Thanks [@carterworks](https://github.com/carterworks)! - Fixed an issue where there are multiple s_kwcid or ef_id parameters in url"

## 2.31.1-beta.1

### Patch Changes

- [#1442](https://github.com/adobe/alloy/pull/1442) [`e27bf44`](https://github.com/adobe/alloy/commit/e27bf44310fc161c05bd22e7ac3aa0100a5b600d) Thanks [@adhir111](https://github.com/adhir111)! - Added consent gating to the Advertising component to ensure no advertising cookies are written before user consent is resolved.

## 2.31.1-beta.0

### Patch Changes

- [#1444](https://github.com/adobe/alloy/pull/1444) [`98cdde5`](https://github.com/adobe/alloy/commit/98cdde510de22e46946261e7dd17ea67921a9ab6) Thanks [@ninaceban](https://github.com/ninaceban)! - Fixed a bug where in Safari the Brand Concierge streams were not parsed

## 2.31.0

### Minor Changes

- [#1440](https://github.com/adobe/alloy/pull/1440) [`3c380f7`](https://github.com/adobe/alloy/commit/3c380f7ccde8591246b48502e1134cda68f8aae0) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Add changeset to increment minor version number as we merged in features before using changesets

### Patch Changes

- [#1414](https://github.com/adobe/alloy/pull/1414) [`75780e5`](https://github.com/adobe/alloy/commit/75780e5f0bdae02d15a1898c7739ec0fa62365e1) Thanks [@carterworks](https://github.com/carterworks)! - Migrate the release process to use the changesets tool.

- [#1424](https://github.com/adobe/alloy/pull/1424) [`40e8677`](https://github.com/adobe/alloy/commit/40e8677f953e1919ba1d9967bc7f4e9080413996) Thanks [@dompuiu](https://github.com/dompuiu)! - Do not remove prehiding snippet when one redirect proposition is returned from the server.

- [#1431](https://github.com/adobe/alloy/pull/1431) [`733eb9e`](https://github.com/adobe/alloy/commit/733eb9e4caf8380ba73624d0dbd658c29803f0fa) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Fixed bug where custom code actions were only run once per view.

- [#1429](https://github.com/adobe/alloy/pull/1429) [`3d9d352`](https://github.com/adobe/alloy/commit/3d9d352624a723374e689ae923a3552c89d4e203) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added additional decisioning type events to ignore list for referrer context

- [#1428](https://github.com/adobe/alloy/pull/1428) [`df3265f`](https://github.com/adobe/alloy/commit/df3265f8c977fb7f8c7f007399d957cb705d1bbb) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! -

- [#1433](https://github.com/adobe/alloy/pull/1433) [`0c0f505`](https://github.com/adobe/alloy/commit/0c0f50516e5c9e3b4d018f00517fd88cec8281b1) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Allow enabled: true to be set in config overrides, allow empty objects to overwrite.

- [#1436](https://github.com/adobe/alloy/pull/1436) [`b3767ce`](https://github.com/adobe/alloy/commit/b3767ce72555cf67a93b1910cd1caa8d566be9ce) Thanks [@dompuiu](https://github.com/dompuiu)! - Handle the case when prepartedConfigOverrides returns null.

- [#1427](https://github.com/adobe/alloy/pull/1427) [`2b83909`](https://github.com/adobe/alloy/commit/2b83909ac2dfe7e6845efd04ad5e40a3db7416b9) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Fixed regression causing errors when using streaming media events

- [#1437](https://github.com/adobe/alloy/pull/1437) [`2fd9ac8`](https://github.com/adobe/alloy/commit/2fd9ac89019d7eab69d4cdf986f595fb6e0f247e) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! -

## 2.31.0-beta.24

### Minor Changes

- [#1440](https://github.com/adobe/alloy/pull/1440) [`3c380f7`](https://github.com/adobe/alloy/commit/3c380f7ccde8591246b48502e1134cda68f8aae0) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Add changeset to increment minor version number as we merged in features before using changesets

## 2.30.1-beta.23

### Patch Changes

- [#1436](https://github.com/adobe/alloy/pull/1436) [`b3767ce`](https://github.com/adobe/alloy/commit/b3767ce72555cf67a93b1910cd1caa8d566be9ce) Thanks [@dompuiu](https://github.com/dompuiu)! - Handle the case when prepartedConfigOverrides returns null.

- [#1437](https://github.com/adobe/alloy/pull/1437) [`2fd9ac8`](https://github.com/adobe/alloy/commit/2fd9ac89019d7eab69d4cdf986f595fb6e0f247e) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! -

## 2.30.1-beta.22

### Patch Changes

- [#1424](https://github.com/adobe/alloy/pull/1424) [`40e8677`](https://github.com/adobe/alloy/commit/40e8677f953e1919ba1d9967bc7f4e9080413996) Thanks [@dompuiu](https://github.com/dompuiu)! - Do not remove prehiding snippet when one redirect proposition is returned from the server.

- [#1431](https://github.com/adobe/alloy/pull/1431) [`733eb9e`](https://github.com/adobe/alloy/commit/733eb9e4caf8380ba73624d0dbd658c29803f0fa) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Fixed bug where custom code actions were only run once per view.

- [#1429](https://github.com/adobe/alloy/pull/1429) [`3d9d352`](https://github.com/adobe/alloy/commit/3d9d352624a723374e689ae923a3552c89d4e203) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Added additional decisioning type events to ignore list for referrer context

- [#1428](https://github.com/adobe/alloy/pull/1428) [`df3265f`](https://github.com/adobe/alloy/commit/df3265f8c977fb7f8c7f007399d957cb705d1bbb) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! -

- [#1433](https://github.com/adobe/alloy/pull/1433) [`0c0f505`](https://github.com/adobe/alloy/commit/0c0f50516e5c9e3b4d018f00517fd88cec8281b1) Thanks [@jonsnyder](https://github.com/jonsnyder)! - Allow enabled: true to be set in config overrides, allow empty objects to overwrite.

- [#1427](https://github.com/adobe/alloy/pull/1427) [`2b83909`](https://github.com/adobe/alloy/commit/2b83909ac2dfe7e6845efd04ad5e40a3db7416b9) Thanks [@Spencer-Smith](https://github.com/Spencer-Smith)! - Fixed regression causing errors when using streaming media events

## 2.30.1-beta.21

### Patch Changes

- [#1414](https://github.com/adobe/alloy/pull/1414) [`75780e5`](https://github.com/adobe/alloy/commit/75780e5f0bdae02d15a1898c7739ec0fa62365e1) Thanks [@carterworks](https://github.com/carterworks)! - Migrate the release process to use the changesets tool.

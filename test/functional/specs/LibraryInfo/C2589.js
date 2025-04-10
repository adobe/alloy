/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { ClientFunction, t } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";

import {
  compose,
  debugEnabled,
  orgMainConfigMain,
} from "../../helpers/constants/configParts/index.js";

import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../../src/constants/decisionProvider.js";
import {
  ALWAYS,
  NEVER,
} from "../../../../src/constants/propositionInteractionType.js";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled, {
  onBeforeEventSend: () => {},
});

createFixture({
  title: "C2589: getLibraryInfo command returns library information",
});

test.meta({
  ID: "C2589",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("C2589: getLibraryInfo command returns library information.", async () => {
  const currentVersion = process.env.npm_package_version;
  const currentCommand = [
    "appendIdentityToUrl",
    "applyPropositions",
    "applyResponse",
    "configure",
    "createEventMergeId",
    "createMediaSession",
    "evaluateRulesets",
    "getIdentity",
    "getLibraryInfo",
    "getMediaAnalyticsTracker",
    "sendEvent",
    "sendMediaEvent",
    "setConsent",
    "setDebug",
    "subscribeRulesetItems",
  ];
  const currentConfigs = {
    clickCollectionEnabled: true,
    clickCollection: {
      downloadLinkEnabled: true,
      eventGroupingEnabled: false,
      externalLinkEnabled: true,
      internalLinkEnabled: true,
      sessionStorageEnabled: false,
    },
    context: ["web", "device", "environment", "placeContext"],
    debugEnabled: true,
    defaultConsent: "in",
    downloadLinkQualifier:
      "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$",
    datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    edgeDomain: "edge.adobedc.net",
    idMigrationEnabled: true,
    onBeforeEventSend: "() => {}",
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
    thirdPartyCookiesEnabled: true,
    targetMigrationEnabled: false,
    personalizationStorageEnabled: false,
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER,
    },
  };

  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  const { libraryInfo } = await alloy.getLibraryInfo();
  delete libraryInfo.configs.edgeBasePath;
  await t.expect(libraryInfo.version).eql(currentVersion);
  await t.expect(libraryInfo.commands).eql(currentCommand);
  await t.expect(libraryInfo.configs).eql(currentConfigs);
});

test("C2589: getLibraryInfo correctly serializes functions in the config", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  const { libraryInfo } = await alloy.getLibraryInfo();
  await t.expect(typeof libraryInfo.configs.onBeforeEventSend).eql("string");
});

test("C2589: libraryInfo can be marshaled to postMessage", async () => {
  const instanceName = "alloy";
  const alloy = createAlloyProxy(instanceName);
  await alloy.configure(debugEnabledConfig);
  const postLibraryInfo = ClientFunction(
    () => {
      return window[instanceName]("getLibraryInfo").then(({ libraryInfo }) => {
        window.postMessage(libraryInfo, "*");
      });
    },
    { dependencies: { instanceName } },
  );
  const result = await postLibraryInfo();
  // This is really just asserting that we got this far. If libraryInfo cannot be
  // marshaled, postLibraryInfo() will throw an exception about cloning functions.
  await t.expect(result).notOk("getLibraryInfo can be marshaled successfully");
});

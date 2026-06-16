/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import packageJson from "../../../../package.json";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../../../core/src/constants/decisionProvider.js";
import {
  ALWAYS,
  NEVER,
} from "../../../../../core/src/constants/propositionInteractionType.js";

const LIBRARY_VERSION = packageJson.version;

const BASE_CONFIG = {
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: "edge.adobedc.net",
  debugEnabled: true,
  onBeforeEventSend: () => {},
};

const KNOWN_COMMANDS = [
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
  "sendConversationEvent",
  "sendEvent",
  "sendMediaEvent",
  "sendPushSubscription",
  "setConsent",
  "setDebug",
  "subscribeRulesetItems",
];

describe("LibraryInfo (C2589)", () => {
  test("getLibraryInfo command returns library version, commands, and config", async ({
    alloy,
  }) => {
    await alloy("configure", { ...BASE_CONFIG, thirdPartyCookiesEnabled: true });

    const { libraryInfo } = await alloy("getLibraryInfo");

    expect(libraryInfo.version).toBe(LIBRARY_VERSION);
    expect(libraryInfo.commands).toEqual(expect.arrayContaining(KNOWN_COMMANDS));
    // Use toMatchObject for configs — new components may add new fields over time.
    expect(libraryInfo.configs).toMatchObject({
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
    });
  });

  test("getLibraryInfo correctly serializes functions in the config", async ({
    alloy,
  }) => {
    await alloy("configure", BASE_CONFIG);

    const { libraryInfo } = await alloy("getLibraryInfo");
    expect(typeof libraryInfo.configs.onBeforeEventSend).toBe("string");
  });

  test("libraryInfo can be posted via postMessage without cloning error", async ({
    alloy,
  }) => {
    await alloy("configure", BASE_CONFIG);

    const { libraryInfo } = await alloy("getLibraryInfo");

    // This should not throw — if libraryInfo can't be cloned (e.g., contains
    // functions), postMessage would throw a DataCloneError.
    expect(() => {
      window.postMessage(libraryInfo, "*");
    }).not.toThrow();
  });
});

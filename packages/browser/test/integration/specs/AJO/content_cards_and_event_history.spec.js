/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";
import {
  contentCardsAndEventHistoryOperationsOnSendEvent,
  contentCardsAndEventHistoryOperations,
} from "../../helpers/mswjs/handlers.js";

describe("AJO content cards and event history operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("are processed correctly on send event response", async ({
    worker,
    alloy,
  }) => {
    let contentCards;

    worker.use(contentCardsAndEventHistoryOperationsOnSendEvent);

    alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });

    alloy("subscribeRulesetItems", {
      surfaces: ["web://testing.alloy.adobe.com"],
      schemas: ["https://ns.adobe.com/personalization/message/content-card"],
      callback: (result) => {
        contentCards = result.propositions;
      },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(1);
    expect(contentCards.length).toBe(1);
  });

  test("are processed correctly on evaluate rulesets", async ({
    worker,
    alloy,
  }) => {
    let contentCards;

    worker.use(contentCardsAndEventHistoryOperations);

    alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });

    alloy("subscribeRulesetItems", {
      surfaces: ["web://testing.alloy.adobe.com"],
      schemas: ["https://ns.adobe.com/personalization/message/content-card"],
      callback: (result) => {
        contentCards = result.propositions;
      },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(undefined);
    expect(contentCards.length).toBe(0);

    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: {
        decisionContext: {
          "~source": "someOtherValue",
        },
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(1);
    expect(contentCards.length).toBe(1);
  });
});

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
import createDecisioningEngine from "../../../../../src/components/DecisioningEngine/index.js";
import { defer } from "../../../../../src/utils/index.js";
import {
  mockRulesetResponseWithCondition,
  proposition
} from "./contextTestUtils";

describe("createDecisioningEngine:commands:evaluateRulesets", () => {
  let mergeData;
  let mockEvent;
  let onResponseHandler;
  let awaitConsentDeferred;
  let consent;
  let persistentStorage;
  let createNamespacedStorage;

  beforeEach(() => {
    mergeData = jasmine.createSpy();
    awaitConsentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: awaitConsentDeferred.promise
    });
    window.referrer =
      "https://www.google.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer";
    persistentStorage = jasmine.createSpyObj("persistentStorage", [
      "getItem",
      "setItem",
      "clear"
    ]);
    createNamespacedStorage = jasmine.createSpy().and.returnValue({
      persistent: persistentStorage
    });
    mockEvent = {
      getContent: () => ({}),
      hasQuery: () => true,
      getViewName: () => undefined,
      mergeData
    };
  });

  const setUpDecisionEngine = ({ personalizationStorageEnabled }) => {
    const config = {
      orgId: "exampleOrgId",
      personalizationStorageEnabled
    };
    const decisioningEngine = createDecisioningEngine({
      config,
      createNamespacedStorage,
      consent
    });
    decisioningEngine.lifecycle.onComponentsRegistered(() => {});
    return decisioningEngine;
  };

  it("should run the evaluateRulesets command and satisfy the rule based on global context", async () => {
    const decisioningEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = onResponse => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"]
          },
          type: "matcher"
        })
      });
    };
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: { decisionContext: {} },
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });

  it("should run the evaluateRulesets command and does not satisfy rule due to unmatched global context", async () => {
    const decisioningEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = onResponse => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/about"]
          },
          type: "matcher"
        })
      });
    };
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: { decisionContext: {} },
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: []
    });
  });

  it("should run the evaluateRulesets command and return propositions with renderDecisions true", async () => {
    const decisioningEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = onResponse => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"]
          },
          type: "matcher"
        })
      });
    };
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      personalization: { decisionContext: {} },
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });

  it("should run the evaluateRulesets command returns propositions with renderDecisions false", async () => {
    const decisioningEngine = setUpDecisionEngine({
      personalizationStorageEnabled: true
    });
    await awaitConsentDeferred.resolve();
    onResponseHandler = onResponse => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "referringPage.path",
            matcher: "eq",
            values: ["/search"]
          },
          type: "matcher"
        })
      });
    };
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: false,
      personalization: { decisionContext: {} },
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });
  it("should clear the local storage when personalizationStorageEnabled is false", async () => {
    setUpDecisionEngine({ personalizationStorageEnabled: false });
    await awaitConsentDeferred.resolve();
    expect(persistentStorage.clear).toHaveBeenCalled();
  });

  it("should set eventRegistry storage when consent is obtained", async () => {
    setUpDecisionEngine({ personalizationStorageEnabled: true });
    await awaitConsentDeferred.resolve();
    await expectAsync(awaitConsentDeferred.promise).toBeResolved();
    expect(persistentStorage.getItem).toHaveBeenCalled();
  });

  it("should clear the local storage when consent is not obtained", async () => {
    setUpDecisionEngine({ personalizationStorageEnabled: true });
    await awaitConsentDeferred.reject();
    await expectAsync(awaitConsentDeferred.promise).toBeRejected();
    expect(persistentStorage.clear).toHaveBeenCalled();
  });
});

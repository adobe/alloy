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
import createDecisioningEngine from "../../../../../src/components/DecisioningEngine/index";
import { injectStorage } from "../../../../../src/utils";
import {
  mockRulesetResponseWithCondition,
  proposition
} from "./contextTestUtils";

describe("createDecisioningEngine:commands:evaluateRulesets", () => {
  let mergeData;
  let mockEvent;
  let onResponseHandler;
  let decisioningEngine;
  beforeEach(() => {
    mergeData = jasmine.createSpy();
    const config = { orgId: "exampleOrgId" };
    window.referrer =
      "https://www.google.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer";
    const createNamespacedStorage = injectStorage(window);
    decisioningEngine = createDecisioningEngine({
      config,
      createNamespacedStorage
    });
    mockEvent = {
      getContent: () => ({}),
      getViewName: () => undefined,
      mergeData
    };
    decisioningEngine.lifecycle.onComponentsRegistered(() => {});
  });

  it("should run the evaluateRulesets command and satisfy the rule based on global context", () => {
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
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });

  it("should run the evaluateRulesets command and does not satisfy rule due to unmatched global context", () => {
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
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: []
    });
  });

  it("should run the evaluateRulesets command and return propositions with renderDecisions true", () => {
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
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });

  it("should run the evaluateRulesets command returns propositions with renderDecisions false", () => {
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
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.evaluateRulesets.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });
});

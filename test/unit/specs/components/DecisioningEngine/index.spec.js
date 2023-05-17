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

describe("createDecisioningEngine:commands:renderDecisions", () => {
  let mockEvent;
  let onResponseHandler;
  let decisioningEngine;
  beforeEach(() => {
    const config = { orgId: "exampleOrgId" };
    const createNamespacedStorage = injectStorage(window);
    decisioningEngine = createDecisioningEngine({
      config,
      createNamespacedStorage
    });
    mockEvent = { getContent: () => ({}), getViewName: () => undefined };
    onResponseHandler = onResponse => {
      onResponse({
        response: mockRulesetResponseWithCondition({
          definition: {
            key: "browser.name",
            matcher: "nc",
            values: ["sampleBrowser"]
          },
          type: "matcher"
        })
      });
    };
    decisioningEngine.lifecycle.onComponentsRegistered(() => {});
  });

  it("should run the renderDecisions command and returns evaluated propositions", () => {
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: true,
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.renderDecisions.run({});
    expect(result).toEqual({
      propositions: [proposition]
    });
  });

  it("should run the renderDecisions command and doesn't return propositions", () => {
    decisioningEngine.lifecycle.onBeforeEvent({
      event: mockEvent,
      renderDecisions: false,
      decisionContext: {},
      onResponse: onResponseHandler
    });
    const result = decisioningEngine.commands.renderDecisions.run({});
    expect(result).toEqual({
      propositions: []
    });
  });
});

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
            matcher: "eq",
            values: ["chrome"]
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

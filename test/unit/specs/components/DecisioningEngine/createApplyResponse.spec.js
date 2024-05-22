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
import createApplyResponse from "../../../../../src/components/DecisioningEngine/createApplyResponse";

describe("DecisioningEngine:createApplyResponse", () => {
  const proposition = {
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTQxMDY0IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    scope: "__view__",
    items: []
  };

  it("calls lifecycle.onDecision with propositions", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const applyResponse = createApplyResponse(lifecycle);

    const mockEvent = { getViewName: () => undefined };
    const personalization = {};

    applyResponse({
      propositions: [proposition],
      event: mockEvent,
      personalization
    });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      renderDecisions: false,
      propositions: [proposition],
      event: mockEvent,
      personalization: {}
    });
  });

  it("calls lifecycle.onDecision with viewName", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const applyResponse = createApplyResponse(lifecycle);
    const mockEvent = { getViewName: () => "oh hai" };

    applyResponse({
      renderDecisions: true,
      event: mockEvent,
      personalization: {},
      propositions: [proposition]
    });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      renderDecisions: true,
      propositions: [proposition],
      event: mockEvent,
      personalization: {}
    });
  });

  it("call lifecycle.onDecision even if no propositions", () => {
    // this use case is necessary for content cards with no items
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const applyResponse = createApplyResponse(lifecycle);
    const mockEvent = { getViewName: () => undefined };

    applyResponse({
      renderDecisions: true,
      propositions: [],
      event: mockEvent,
      personalization: {}
    });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      renderDecisions: true,
      propositions: [],
      event: mockEvent,
      personalization: {}
    });
  });
});

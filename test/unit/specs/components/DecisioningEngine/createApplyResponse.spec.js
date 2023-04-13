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

    applyResponse({ propositions: [proposition] });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      viewName: undefined,
      propositions: [proposition]
    });
  });

  it("calls lifecycle.onDecision with viewName", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const applyResponse = createApplyResponse(lifecycle);

    applyResponse({ viewName: "oh hai", propositions: [proposition] });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      viewName: "oh hai",
      propositions: [proposition]
    });
  });

  it("does not call lifecycle.onDecision if no propositions", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const applyResponse = createApplyResponse(lifecycle);

    applyResponse({ propositions: [] });

    expect(lifecycle.onDecision).not.toHaveBeenCalled();
  });
});

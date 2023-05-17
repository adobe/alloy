import {
  mockWindow,
  setupResponseHandler,
  proposition
} from "./contextTestUtils";

describe("DecisioningEngine:globalContext:browser", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = jasmine.createSpy();
  });
  it("satisfies rule based on matched browser", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "browser.name",
        matcher: "eq",
        values: ["chrome"]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched browser", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "browser.name",
        matcher: "co",
        values: ["Edge"]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });
});

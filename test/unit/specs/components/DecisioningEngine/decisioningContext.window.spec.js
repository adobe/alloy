import {
  mockWindow,
  setupResponseHandler,
  proposition
} from "./contextTestUtils";

describe("DecisioningEngine:globalContext:window", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = jasmine.createSpy();
  });

  it("satisfies rule based on matched window height", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "window.height",
        matcher: "gt",
        values: [90]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched window height", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        height: 50
      }),
      {
        definition: {
          key: "window.height",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched window width", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        width: 200
      }),
      {
        definition: {
          key: "window.width",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched window width", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        width: 50
      }),
      {
        definition: {
          key: "window.width",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched window scrollX", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollX: 200
      }),
      {
        definition: {
          key: "window.scrollX",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched window scrollX", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollX: 50
      }),
      {
        definition: {
          key: "window.scrollX",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched window scrollY", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollY: 200
      }),
      {
        definition: {
          key: "window.scrollY",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
  });

  it("does not satisfy rule due to unmatched window scrollY", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollY: 50
      }),
      {
        definition: {
          key: "window.scrollY",
          matcher: "gt",
          values: [90]
        },
        type: "matcher"
      }
    );
  });
});

import createOnResponseHandler from "../../../../../src/components/DecisioningEngine/createOnResponseHandler";
import createDecisionProvider from "../../../../../src/components/DecisioningEngine/createDecisionProvider";
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

const mockWindow = ({
  title = "My awesome website",
  referrer = "https://www.google.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer",
  url = "https://pro.mywebsite.org:8080/about?m=1&t=5&name=jimmy#home",
  width = 100,
  height = 100,
  scrollX = 0,
  scrollY = 10,
  userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36"
}) => ({
  title,
  referrer,
  url,
  width,
  height,
  scrollX,
  scrollY,
  navigator: {
    userAgent
  }
});

const proposition = {
  id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
  items: [
    {
      schema: "https://ns.adobe.com/personalization/mock-action",
      data: {
        hello: "kitty"
      },
      id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
    }
  ],
  scope: "web://mywebsite.com"
};

const payloadWithCondition = condition => {
  return {
    id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
    items: [
      {
        id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
        schema: "https://ns.adobe.com/personalization/json-ruleset-item",
        data: {
          content: JSON.stringify({
            version: 1,
            rules: [
              {
                condition: {
                  definition: {
                    conditions: [condition],
                    logic: "and"
                  },
                  type: "group"
                },
                consequences: [
                  {
                    type: "item",
                    detail: {
                      schema:
                        "https://ns.adobe.com/personalization/mock-action",
                      data: {
                        hello: "kitty"
                      },
                      id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                    },
                    id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                  }
                ]
              }
            ]
          })
        }
      }
    ],
    scope: "web://mywebsite.com"
  };
};

const mockRulesetResponseWithCondition = condition => {
  return {
    getPayloadsByType: () => [
      payloadWithCondition({
        definition: {
          conditions: [condition],
          logic: "and"
        },
        type: "group"
      })
    ]
  };
};

describe("DecisioningEngine:globalContext:window", () => {
  let storage;
  let eventRegistry;
  let decisionProvider;
  let onResponseHandler;
  let applyResponse;

  const mockEvent = { getContent: () => ({}), getViewName: () => undefined };

  const setupResponseHandler = (window, condition) => {
    const contextProvider = createContextProvider({
      eventRegistry,
      window
    });

    onResponseHandler = createOnResponseHandler({
      decisionProvider,
      applyResponse,
      event: mockEvent,
      decisionContext: contextProvider.getContext()
    });

    onResponseHandler({
      response: mockRulesetResponseWithCondition(condition)
    });
  };

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    eventRegistry = createEventRegistry({ storage });
    decisionProvider = createDecisionProvider();
    applyResponse = jasmine.createSpy();
  });

  it("satisfies rule based on matched window height", () => {
    setupResponseHandler(mockWindow({}), {
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

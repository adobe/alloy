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

let mockedTimestamp;
describe("DecisioningEngine:globalContext:timeContext", () => {
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
    mockedTimestamp = new Date(Date.UTC(2023, 4, 11, 13, 34, 56));
    jasmine.clock().install();
    jasmine.clock().mockDate(mockedTimestamp);
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("satisfies rule based on matched pageLoadTimestamp", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "pageLoadTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched pageLoadTimestamp", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "pageLoadTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentTimestamp", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentTimestamp", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentDate", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentDate",
        matcher: "eq",
        values: [mockedTimestamp.getDate()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentDate", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentDate",
        matcher: "eq",
        values: [mockedTimestamp.getDate() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentDay", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentDay",
        matcher: "eq",
        values: [mockedTimestamp.getDay()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentDay", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentDay",
        matcher: "eq",
        values: [mockedTimestamp.getDay() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentHour", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentHour",
        matcher: "eq",
        values: [mockedTimestamp.getHours()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentHour", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentHour",
        matcher: "eq",
        values: [mockedTimestamp.getHours() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentMinute", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentMinute",
        matcher: "eq",
        values: [mockedTimestamp.getMinutes()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentMinute", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentMinute",
        matcher: "eq",
        values: [mockedTimestamp.getMinutes() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentMonth", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentMonth",
        matcher: "eq",
        values: [mockedTimestamp.getMonth()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentMonth", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentMonth",
        matcher: "eq",
        values: [mockedTimestamp.getMonth() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentYear", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentYear",
        matcher: "eq",
        values: [mockedTimestamp.getFullYear()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentYear", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "currentYear",
        matcher: "eq",
        values: [mockedTimestamp.getFullYear() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched pageVisitDuration", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "pageVisitDuration",
        matcher: "eq",
        values: [0]
      },
      type: "matcher"
    });
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched pageVisitDuration", () => {
    setupResponseHandler(mockWindow({}), {
      definition: {
        key: "pageVisitDuration",
        matcher: "eq",
        values: [1]
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

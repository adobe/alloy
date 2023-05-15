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

describe("DecisioningEngine:globalContext:page", () => {
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

  it("satisfies rule based on matched page url", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.url",
          matcher: "eq",
          values: ["https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"]
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

  it("does not satisfy rule due to unmatched page url", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "page.url",
          matcher: "eq",
          values: ["https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"]
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

  it("satisfy rule based on matched domain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.domain",
          matcher: "eq",
          values: ["pro.mywebsite.org"]
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

  it("does not satisfy rule due to unmatched domain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.domain",
          matcher: "eq",
          values: ["pro.mywebsite.com"]
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

  it("satisfied rule based on matched page subdomain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.subdomain",
          matcher: "eq",
          values: ["pro"]
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
  // Note that we have custom parse url [refer to implementation] which will give empty string in case of www
  it("does not satisfy rule due to unmatched page subdomain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://www.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.subdomain",
          matcher: "eq",
          values: ["www"]
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

  it("satisfies rule based on matched page topLevelDomain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.topLevelDomain",
          matcher: "eq",
          values: ["org"]
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

  it("does not satisfy rule due to unmatched page topLevelDomain", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.topLevelDomain",
          matcher: "eq",
          values: ["com"]
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

  it("satisfies rule based on matched page path", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.path",
          matcher: "eq",
          values: ["/about"]
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

  it("does not satisfy rule due to unmatched page path", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.path",
          matcher: "eq",
          values: ["/home"]
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

  it("satisfies rule based on matched page query", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.query",
          matcher: "co",
          values: ["name=bob"]
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

  it("does not satisfy rule due to unmatched page query", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "page.query",
          matcher: "co",
          values: ["name=bob"]
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

  it("satisfies rule based on matched page fragment", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.fragment",
          matcher: "eq",
          values: ["home"]
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

  it("does not satisfy rule due to unmatched page fragment", () => {
    setupResponseHandler(
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#about"
      }),
      {
        definition: {
          key: "page.fragment",
          matcher: "eq",
          values: ["home"]
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
});

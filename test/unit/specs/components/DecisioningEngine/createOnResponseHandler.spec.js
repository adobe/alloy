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
import createOnResponseHandler from "../../../../../src/components/DecisioningEngine/createOnResponseHandler";
import createDecisionProvider from "../../../../../src/components/DecisioningEngine/createDecisionProvider";
import createApplyResponse from "../../../../../src/components/DecisioningEngine/createApplyResponse";

describe("DecisioningEngine:createOnResponseHandler", () => {
  const DECISION_CONTEXT = {
    browser: {
      name: "Chrome"
    },
    page: {
      title: "My awesome website",
      url: "https://my.web-site.net:8080/about?m=1&t=5&name=jimmy#home",
      path: "/about",
      query: "m=1&t=5&name=jimmy",
      fragment: "home",
      domain: "my.web-site.net",
      subdomain: "my",
      topLevelDomain: "net"
    },
    referringPage: {
      url: "https://stage.applookout.net/",
      path: "/",
      query: "",
      fragment: "",
      domain: "stage.applookout.net",
      subdomain: "stage",
      topLevelDomain: "net"
    },
    pageLoadTimestamp: 1683838834925,
    currentTimestamp: 1683838834941,
    currentDate: 11,
    currentDay: 4,
    currentHour: 14,
    currentMinute: 0,
    currentMonth: 4,
    currentYear: 2023,
    pageVisitDuration: 16,
    window: {
      height: 253,
      width: 1706,
      scrollY: 10,
      scrollX: 10
    }
  };
  it("calls lifecycle.onDecision with propositions based on decisionContext", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const decisionProvider = createDecisionProvider();
    const applyResponse = createApplyResponse(lifecycle);

    const event = {
      getViewName: () => undefined,
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              viewName: "contact",
              URL: "https://mywebsite.com"
            },
            webReferrer: {
              URL: "https://google.com"
            }
          },
          timestamp: new Date().toISOString(),
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy",
            version: "2.15.0",
            environment: "browser"
          }
        },
        data: {
          moo: "woof"
        }
      })
    };

    const decisionContext = DECISION_CONTEXT;

    const responseHandler = createOnResponseHandler({
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });

    const response = {
      getPayloadsByType: () => [
        {
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
                          conditions: [
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "page.fragment",
                                      matcher: "eq",
                                      values: ["home", "sweet"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "referringPage.domain",
                                      matcher: "eq",
                                      values: ["stage.applookout.net"]
                                    },
                                    type: "matcher"
                                  }
                                ],
                                logic: "and"
                              },
                              type: "group"
                            }
                          ],
                          logic: "and"
                        },
                        type: "group"
                      },
                      consequences: [
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                              type: "setAttribute",
                              content: {
                                src: "img/demo-marketing-offer1-exp-A.png"
                              },
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)"
                            },
                            id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                          },
                          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                        },
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                              type: "setHtml",
                              content: "Hello Treatment A!",
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
                            },
                            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                          },
                          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                        }
                      ]
                    }
                  ]
                })
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    };

    responseHandler({
      response
    });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      viewName: undefined,
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png"
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)"
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    });
  });

  it("calls lifecycle.onDecision with propositions based on xdm and event data", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const decisionProvider = createDecisionProvider();
    const applyResponse = createApplyResponse(lifecycle);

    const event = {
      getViewName: () => "home",
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              viewName: "contact",
              URL: "https://mywebsite.com"
            },
            webReferrer: {
              URL: "https://google.com"
            }
          },
          timestamp: new Date().toISOString(),
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy",
            version: "12345",
            environment: "browser"
          }
        },
        data: {
          moo: "woof"
        }
      })
    };

    const decisionContext = DECISION_CONTEXT;

    const responseHandler = createOnResponseHandler({
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });

    const response = {
      getPayloadsByType: () => [
        {
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
                          conditions: [
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "xdm.web.webPageDetails.viewName",
                                      matcher: "eq",
                                      values: ["contact"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "xdm.implementationDetails.version",
                                      matcher: "eq",
                                      values: ["12345"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "data.moo",
                                      matcher: "eq",
                                      values: ["woof"]
                                    },
                                    type: "matcher"
                                  }
                                ],
                                logic: "and"
                              },
                              type: "group"
                            }
                          ],
                          logic: "and"
                        },
                        type: "group"
                      },
                      consequences: [
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                              type: "setHtml",
                              content: "Hello Treatment A!",
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
                            },
                            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                          },
                          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                        }
                      ]
                    }
                  ]
                })
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    };

    responseHandler({
      response
    });

    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      viewName: "home",
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    });
  });
  it("calls lifecycle.onDecision with propositions based on the global context", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const decisionProvider = createDecisionProvider();
    const applyResponse = createApplyResponse(lifecycle);
    const event = {
      getViewName: () => undefined,
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              viewName: "contact",
              URL: "https://mywebsite.com"
            },
            webReferrer: {
              URL: "https://google.com"
            }
          },
          timestamp: new Date().toISOString(),
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy",
            version: "2.15.0",
            environment: "browser"
          }
        },
        data: {
          moo: "woof"
        }
      })
    };
    const decisionContext = DECISION_CONTEXT;
    const responseHandler = createOnResponseHandler({
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });
    const response = {
      getPayloadsByType: () => [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44afabc",
          items: [
            {
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa123",
              schema: "https://ns.adobe.com/personalization/json-ruleset-item",
              data: {
                content: JSON.stringify({
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "browser.name",
                                      matcher: "eq",
                                      values: ["Chrome", "safari"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "page.domain",
                                      matcher: "eq",
                                      values: ["my.web-site.net"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "pageVisitDuration",
                                      matcher: "gt",
                                      values: [10]
                                    },
                                    type: "matcher"
                                  }
                                ],
                                logic: "and"
                              },
                              type: "group"
                            }
                          ],
                          logic: "and"
                        },
                        type: "group"
                      },
                      consequences: [
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                              type: "setAttribute",
                              content: {
                                src: "img/demo-marketing-offer1-exp-A.png"
                              },
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)"
                            },
                            id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                          },
                          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                        },
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                              type: "setHtml",
                              content: "Hello Treatment A!",
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
                            },
                            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                          },
                          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                        }
                      ]
                    }
                  ]
                })
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    };

    responseHandler({
      response
    });
    expect(lifecycle.onDecision).toHaveBeenCalledWith({
      viewName: undefined,
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44afabc",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png"
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)"
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    });
  });
  it("does not  call lifecycle.onDecision with propositions based on non matching values from the global context", () => {
    const lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    const decisionProvider = createDecisionProvider();
    const applyResponse = createApplyResponse(lifecycle);
    const event = {
      getViewName: () => undefined,
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              viewName: "contact",
              URL: "https://mywebsite.com"
            },
            webReferrer: {
              URL: "https://google.com"
            }
          },
          timestamp: new Date().toISOString(),
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy",
            version: "2.15.0",
            environment: "browser"
          }
        },
        data: {
          moo: "woof"
        }
      })
    };
    const decisionContext = DECISION_CONTEXT;
    const responseHandler = createOnResponseHandler({
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });
    const response = {
      getPayloadsByType: () => [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44afabc",
          items: [
            {
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa123",
              schema: "https://ns.adobe.com/personalization/json-ruleset-item",
              data: {
                content: JSON.stringify({
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "browser.name",
                                      matcher: "eq",
                                      values: ["Chrome", "safari"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "page.domain",
                                      matcher: "eq",
                                      values: ["my.web-site.net"]
                                    },
                                    type: "matcher"
                                  },
                                  {
                                    definition: {
                                      key: "pageVisitDuration",
                                      matcher: "gt",
                                      values: [100]
                                    },
                                    type: "matcher"
                                  }
                                ],
                                logic: "and"
                              },
                              type: "group"
                            }
                          ],
                          logic: "and"
                        },
                        type: "group"
                      },
                      consequences: [
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                              type: "setAttribute",
                              content: {
                                src: "img/demo-marketing-offer1-exp-A.png"
                              },
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)"
                            },
                            id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                          },
                          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
                        },
                        {
                          type: "item",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/dom-action",
                            data: {
                              selector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                              type: "setHtml",
                              content: "Hello Treatment A!",
                              prehidingSelector:
                                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
                            },
                            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                          },
                          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
                        }
                      ]
                    }
                  ]
                })
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    };

    responseHandler({
      response
    });
    expect(lifecycle.onDecision).not.toHaveBeenCalled();
  });
});

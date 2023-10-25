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
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createOnResponseHandler", () => {
  let lifecycle;
  let storage;
  let eventRegistry;
  let decisionProvider;
  let applyResponse;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onDecision: Promise.resolve()
    });

    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    eventRegistry = createEventRegistry({ storage });

    decisionProvider = createDecisionProvider({ eventRegistry });
    applyResponse = createApplyResponse(lifecycle);
  });

  it("calls lifecycle.onDecision with propositions based on decisionContext", () => {
    const event = {
      getViewName: () => undefined,
      hasQuery: () => true,
      getContent: () => ({
        query: {},
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

    const decisionContext = {
      color: "orange",
      action: "lipstick"
    };

    const responseHandler = createOnResponseHandler({
      renderDecisions: true,
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });

    const response = {
      getPayloadsByType: () => [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz"
            }
          },
          items: [
            {
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
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
                                    key: "color",
                                    matcher: "eq",
                                    values: ["orange", "blue"]
                                  },
                                  type: "matcher"
                                },
                                {
                                  definition: {
                                    key: "action",
                                    matcher: "eq",
                                    values: ["lipstick"]
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
                        type: "schema",
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
                        type: "schema",
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
      renderDecisions: true,
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz"
            }
          },
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
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: jasmine.any(Number),
                displayedDate: undefined
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
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                qualifiedDate: jasmine.any(Number),
                displayedDate: undefined
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
    const event = {
      getViewName: () => "home",
      hasQuery: () => true,
      getContent: () => ({
        query: {},
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

    const decisionContext = {};

    const responseHandler = createOnResponseHandler({
      renderDecisions: true,
      decisionProvider,
      applyResponse,
      event,
      decisionContext
    });

    const response = {
      getPayloadsByType: () => [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz"
            }
          },
          items: [
            {
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
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
                        type: "schema",
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
      renderDecisions: true,
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz"
            }
          },
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                qualifiedDate: jasmine.any(Number),
                displayedDate: undefined
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ]
    });
  });
});

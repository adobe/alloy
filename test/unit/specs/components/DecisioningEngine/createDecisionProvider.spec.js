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
import createDecisionProvider from "../../../../../src/components/DecisioningEngine/createDecisionProvider";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createDecisionProvider", () => {
  let decisionProvider;
  let storage;
  let eventRegistry;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    eventRegistry = createEventRegistry({ storage });

    decisionProvider = createDecisionProvider({ eventRegistry, storage });
    decisionProvider.addPayloads([
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
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
        scope: "web://mywebsite.com"
      },
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
        id: "3d5d69cd-acde-4eca-b43b-a54574b67bb0",
        items: [
          {
            id: "5229f502-38d6-40c3-9a3a-b5b1a6adc441",
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
                                    values: ["home"]
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
                            selector: "div#spa #spa-content h3",
                            type: "setHtml",
                            content: "i can haz?",
                            prehidingSelector: "div#spa #spa-content h3"
                          },
                          id: "8a0d7a45-70fb-4845-a093-2133b5744c8d"
                        },
                        id: "8a0d7a45-70fb-4845-a093-2133b5744c8d"
                      },
                      {
                        type: "item",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/dom-action",
                          data: {
                            selector: "div#spa #spa-content p",
                            type: "setHtml",
                            content: "ALL YOUR BASE ARE BELONG TO US",
                            prehidingSelector: "div#spa #spa-content p"
                          },
                          id: "a44af51a-e073-4e8c-92e1-84ac28210043"
                        },
                        id: "a44af51a-e073-4e8c-92e1-84ac28210043"
                      }
                    ]
                  }
                ]
              })
            }
          }
        ],
        scope: "web://mywebsite.com"
      }
    ]);
  });
  it("returns a single payload with items that qualify", () => {
    expect(
      decisionProvider.evaluate({ color: "blue", action: "lipstick" })
    ).toEqual([
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
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
            id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          },
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
              type: "setHtml",
              content: "Hello Treatment A!",
              prehidingSelector:
                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
            },
            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          }
        ],
        scope: "web://mywebsite.com"
      }
    ]);
  });
  it("returns a different single payload with items that qualify", () => {
    expect(
      decisionProvider.evaluate({ "xdm.web.webPageDetails.viewName": "home" })
    ).toEqual([
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
        id: "3d5d69cd-acde-4eca-b43b-a54574b67bb0",
        items: [
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "div#spa #spa-content h3",
              type: "setHtml",
              content: "i can haz?",
              prehidingSelector: "div#spa #spa-content h3"
            },
            id: "8a0d7a45-70fb-4845-a093-2133b5744c8d",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          },
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "div#spa #spa-content p",
              type: "setHtml",
              content: "ALL YOUR BASE ARE BELONG TO US",
              prehidingSelector: "div#spa #spa-content p"
            },
            id: "a44af51a-e073-4e8c-92e1-84ac28210043",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          }
        ],
        scope: "web://mywebsite.com"
      }
    ]);
  });
  it("returns two payloads with items that qualify", () => {
    expect(
      decisionProvider.evaluate({
        color: "blue",
        action: "lipstick",
        "xdm.web.webPageDetails.viewName": "home"
      })
    ).toEqual([
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
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
            id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          },
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
              type: "setHtml",
              content: "Hello Treatment A!",
              prehidingSelector:
                "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)"
            },
            id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          }
        ],
        scope: "web://mywebsite.com"
      },
      {
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            eventToken: "abc"
          },
          strategies: [
            {
              strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
              treatmentID: "yu7rkogezumca7i0i44v"
            }
          ],
          activity: {
            id:
              "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
        },
        id: "3d5d69cd-acde-4eca-b43b-a54574b67bb0",
        items: [
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "div#spa #spa-content h3",
              type: "setHtml",
              content: "i can haz?",
              prehidingSelector: "div#spa #spa-content h3"
            },
            id: "8a0d7a45-70fb-4845-a093-2133b5744c8d",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          },
          {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "div#spa #spa-content p",
              type: "setHtml",
              content: "ALL YOUR BASE ARE BELONG TO US",
              prehidingSelector: "div#spa #spa-content p"
            },
            id: "a44af51a-e073-4e8c-92e1-84ac28210043",
            qualifiedDate: jasmine.any(Number),
            displayedDate: undefined
          }
        ],
        scope: "web://mywebsite.com"
      }
    ]);
  });

  it("ignores payloads that aren't json-ruleset type", () => {
    decisionProvider.addPayload({
      id: "AT:eyJhY3Rpdml0eUlkIjoiMTQxMDY0IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
      scope: "__view__",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: {
          id: "141064"
        },
        experience: {
          id: "0"
        },
        strategies: [
          {
            algorithmID: "0",
            trafficType: "0"
          }
        ],
        characteristics: {
          eventToken: "abc"
        },
        correlationID: "141064:0:0:0"
      },
      items: [
        {
          id: "284525",
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "setHtml",
            format: "application/vnd.adobe.target.dom-action",
            content: "<div>oh hai</div>",
            selector: "head",
            prehidingSelector: "head"
          }
        }
      ]
    });

    expect(decisionProvider.evaluate()).toEqual([]);
  });
});

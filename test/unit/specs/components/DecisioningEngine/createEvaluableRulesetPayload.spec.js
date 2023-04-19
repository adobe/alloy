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
import RulesEngine from "@adobe/aep-rules-engine";
import createEvaluableRulesetPayload from "../../../../../src/components/DecisioningEngine/createEvaluableRulesetPayload";

describe("DecisioningEngine:createEvaluableRulesetPayload", () => {
  it("does", () => {
    const ruleset = RulesEngine({
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
                schema: "https://ns.adobe.com/personalization/dom-action",
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
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
            }
          ]
        }
      ]
    });

    expect(ruleset.execute({ color: "orange", action: "lipstick" })).toEqual([
      [
        {
          type: "item",
          detail: {
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
          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
        },
        {
          type: "item",
          detail: {
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              selector: "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
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
    ]);
  });
  it("works", () => {
    const evaluableRulesetPayload = createEvaluableRulesetPayload({
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
    });

    expect(
      evaluableRulesetPayload.evaluate({ color: "orange", action: "lipstick" })
    ).toEqual({
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
          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
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
          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f"
        }
      ],
      scope: "web://mywebsite.com"
    });
  });
});

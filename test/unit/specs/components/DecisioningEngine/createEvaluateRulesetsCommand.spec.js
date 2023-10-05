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
import createEvaluateRulesetsCommand from "../../../../../src/components/DecisioningEngine/createEvaluateRulesetsCommand";
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";
import createDecisionProvider from "../../../../../src/components/DecisioningEngine/createDecisionProvider";
import createApplyResponse from "../../../../../src/components/DecisioningEngine/createApplyResponse";
import createIndexedDB from "../../../../../src/components/DecisioningEngine/createIndexedDB";

describe("DecisioningEngine:evaluateRulesetsCommand", () => {
  let onDecision;
  let applyResponse;
  let eventRegistry;
  let contextProvider;
  let decisionProvider;
  let evaluateRulesetsCommand;
  let indexedDB;

  beforeEach(async () => {
    indexedDB = createIndexedDB();
    await indexedDB.setupIndexedDB();
    onDecision = jasmine.createSpy();
    applyResponse = createApplyResponse({ onDecision });
    eventRegistry = createEventRegistry({ indexedDB });
    contextProvider = createContextProvider({ eventRegistry, window });
    decisionProvider = createDecisionProvider({ eventRegistry });

    decisionProvider.addPayload({
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
                                values: ["greet"]
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
                  }
                ]
              }
            ]
          }
        }
      ],
      scope: "web://mywebsite.com"
    });

    evaluateRulesetsCommand = createEvaluateRulesetsCommand({
      contextProvider,
      decisionProvider
    });
  });

  afterEach(async () => {
    await indexedDB.clearIndexedDB();
    indexedDB.getIndexDB().close();
  });

  it("onDecisions receives renderDecisions=true", async () => {
    const result = await evaluateRulesetsCommand.run({
      renderDecisions: true,
      decisionContext: { color: "orange", action: "greet" },
      applyResponse
    });

    const expectedResult = {
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
            }
          ],
          scope: "web://mywebsite.com"
        }
      ]
    };

    expect(result).toEqual(expectedResult);
    expect(onDecision).toHaveBeenCalledOnceWith({
      viewName: undefined,
      renderDecisions: true,
      ...expectedResult
    });
  });

  it("onDecisions receives renderDecisions=false", async () => {
    const result = await evaluateRulesetsCommand.run({
      decisionContext: { color: "orange", action: "greet" },
      applyResponse
    });

    const expectedResult = {
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
            }
          ],
          scope: "web://mywebsite.com"
        }
      ]
    };

    expect(result).toEqual(expectedResult);
    expect(onDecision).toHaveBeenCalledOnceWith({
      viewName: undefined,
      renderDecisions: false,
      ...expectedResult
    });
  });
});

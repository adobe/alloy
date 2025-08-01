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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createEvaluateRulesetsCommand from "../../../../../src/components/RulesEngine/createEvaluateRulesetsCommand.js";
import createContextProvider from "../../../../../src/components/RulesEngine/createContextProvider.js";
import createEventRegistry from "../../../../../src/components/RulesEngine/createEventRegistry.js";
import createDecisionProvider from "../../../../../src/components/RulesEngine/createDecisionProvider.js";
import createApplyResponse from "../../../../../src/components/RulesEngine/createApplyResponse.js";
import injectGetBrowser from "../../../../../src/utils/injectGetBrowser.js";

describe("RulesEngine:evaluateRulesetsCommand", () => {
  let onDecision;
  let applyResponse;
  let storage;
  let eventRegistry;
  let getBrowser;
  let contextProvider;
  let decisionProvider;
  let evaluateRulesetsCommand;

  beforeEach(() => {
    onDecision = vi.fn();

    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };

    eventRegistry = createEventRegistry({
      storage,
      logger: { info: vi.fn() },
    });

    applyResponse = createApplyResponse({
      lifecycle: {
        onDecision,
      },
      eventRegistry,
    });

    getBrowser = injectGetBrowser({
      userAgent: window.navigator.userAgent,
    });

    contextProvider = createContextProvider({
      eventRegistry,
      window,
      getBrowser,
    });

    decisionProvider = createDecisionProvider({
      eventRegistry,
    });

    decisionProvider.addPayload({
      id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
      scopeDetails: {
        activity: {
          id: "abc#xyz",
        },
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
                                values: ["orange", "blue"],
                              },
                              type: "matcher",
                            },
                            {
                              definition: {
                                key: "action",
                                matcher: "eq",
                                values: ["greet"],
                              },
                              type: "matcher",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                    ],
                    logic: "and",
                  },
                  type: "group",
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
                          src: "img/demo-marketing-offer1-exp-A.png",
                        },
                        prehidingSelector:
                          "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                      },
                      id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
                    },
                    id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
                  },
                ],
              },
            ],
          },
        },
      ],
      scope: "web://mywebsite.com",
    });
    evaluateRulesetsCommand = createEvaluateRulesetsCommand({
      contextProvider,
      decisionProvider,
    });
  });
  it("onDecisions receives renderDecisions=true", () => {
    const result = evaluateRulesetsCommand.run({
      renderDecisions: true,
      decisionContext: {
        color: "orange",
        action: "greet",
      },
      applyResponse,
    });
    const expectedResult = {
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz",
            },
          },
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png",
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: expect.any(Number),
                displayedDate: undefined,
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            },
          ],
          scope: "web://mywebsite.com",
        },
      ],
    };
    expect(result).toEqual(expectedResult);
    expect(onDecision).toHaveBeenNthCalledWith(1, {
      renderDecisions: true,
      event: undefined,
      personalization: undefined,
      ...expectedResult,
    });
  });
  it("onDecisions receives renderDecisions=false", () => {
    const result = evaluateRulesetsCommand.run({
      decisionContext: {
        color: "orange",
        action: "greet",
      },
      applyResponse,
    });
    const expectedResult = {
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scopeDetails: {
            activity: {
              id: "abc#xyz",
            },
          },
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png",
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: expect.any(Number),
                displayedDate: undefined,
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            },
          ],
          scope: "web://mywebsite.com",
        },
      ],
    };
    expect(result).toEqual(expectedResult);
    expect(onDecision).toHaveBeenNthCalledWith(1, {
      renderDecisions: false,
      event: undefined,
      personalization: undefined,
      ...expectedResult,
    });
  });
});

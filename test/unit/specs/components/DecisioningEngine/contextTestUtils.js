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
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider";
import createOnResponseHandler from "../../../../../src/components/DecisioningEngine/createOnResponseHandler";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";
import createDecisionProvider from "../../../../../src/components/DecisioningEngine/createDecisionProvider";

export const proposition = {
  id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
  items: [
    {
      schema: "https://ns.adobe.com/personalization/mock-action",
      data: {
        hello: "kitty"
      },
      qualifiedDate: jasmine.any(Number),
      displayedDate: undefined,
      id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe"
    }
  ],
  scope: "web://mywebsite.com"
};

export const mockWindow = ({
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

export const payloadWithCondition = condition => {
  return {
    id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
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
                  conditions: [condition],
                  logic: "and"
                },
                type: "group"
              },
              consequences: [
                {
                  type: "schema",
                  detail: {
                    schema: "https://ns.adobe.com/personalization/mock-action",
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
        }
      }
    ],
    scope: "web://mywebsite.com"
  };
};
export const mockRulesetResponseWithCondition = condition => {
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

const mockEvent = { getContent: () => ({}), getViewName: () => undefined };

export const setupResponseHandler = (applyResponse, window, condition) => {
  const storage = jasmine.createSpyObj("storage", [
    "getItem",
    "setItem",
    "clear"
  ]);
  const eventRegistry = createEventRegistry({ storage });
  const decisionProvider = createDecisionProvider({ eventRegistry });

  const contextProvider = createContextProvider({ eventRegistry, window });

  const onResponseHandler = createOnResponseHandler({
    renderDecisions: true,
    decisionProvider,
    applyResponse,
    event: mockEvent,
    decisionContext: contextProvider.getContext()
  });

  onResponseHandler({
    response: mockRulesetResponseWithCondition(condition)
  });
};

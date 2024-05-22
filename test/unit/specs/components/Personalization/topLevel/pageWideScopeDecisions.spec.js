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
import { PAGE_WIDE_SCOPE_DECISIONS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("PAGE_WIDE_SCOPE_DECISIONS", async () => {
    const mocks = buildMocks(PAGE_WIDE_SCOPE_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      PAGE_WIDE_SCOPE_DECISIONS
    );
    expect(event.toJSON()).toEqual({
      query: {
        personalization: {
          schemas: [
            "https://ns.adobe.com/personalization/default-content-item",
            "https://ns.adobe.com/personalization/html-content-item",
            "https://ns.adobe.com/personalization/json-content-item",
            "https://ns.adobe.com/personalization/redirect-item",
            "https://ns.adobe.com/personalization/ruleset-item",
            "https://ns.adobe.com/personalization/message/in-app",
            "https://ns.adobe.com/personalization/message/content-card",
            "https://ns.adobe.com/personalization/dom-action"
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"]
        }
      }
    });
    expect(result.propositions).toEqual(
      jasmine.arrayWithExactContents([
        {
          renderAttempted: true,
          id: "TNT:activity1:experience1",
          scope: "__view__",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo",
                content: "<div>Hola Mundo</div>"
              }
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo2",
                content: "<div>here is a target activity</div>"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            }
          ],
          scopeDetails: {
            blah: "test"
          }
        },
        {
          renderAttempted: true,
          id: "AJO:campaign1:message1",
          scope: "web://alloy.test.com/test/page/1",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo",
                content: "<div>Hola Mundo</div>"
              }
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo2",
                content: "<div>here is a target activity</div>"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            }
          ],
          scopeDetails: {
            decisionProvider: "AJO"
          }
        },
        {
          renderAttempted: false,
          id: "TNT:activity1:experience1",
          scope: "__view__",
          items: [
            {
              schema: "https://ns.adove.com/experience/item",
              data: {
                id: "A",
                content: "Banner A ...."
              }
            },
            {
              schema: "https://ns.adove.com/experience/item",
              data: {
                id: "B",
                content: "Banner B ...."
              }
            }
          ],
          scopeDetails: {
            blah: "test"
          }
        }
      ])
    );
    expect(result.decisions).toEqual(
      jasmine.arrayWithExactContents([
        {
          id: "TNT:activity1:experience1",
          scope: "__view__",
          items: [
            {
              schema: "https://ns.adove.com/experience/item",
              data: {
                id: "A",
                content: "Banner A ...."
              }
            },
            {
              schema: "https://ns.adove.com/experience/item",
              data: {
                id: "B",
                content: "Banner B ...."
              }
            }
          ],
          scopeDetails: {
            blah: "test"
          }
        }
      ])
    );
    expect(mocks.sendEvent).toHaveBeenCalledWith({
      xdm: {
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "TNT:activity1:experience1",
                scope: "__view__",
                scopeDetails: {
                  blah: "test"
                }
              },
              {
                id: "AJO:campaign1:message1",
                scope: "web://alloy.test.com/test/page/1",
                scopeDetails: {
                  decisionProvider: "AJO"
                }
              }
            ],
            propositionEventType: {
              display: 1
            }
          }
        },
        eventType: "decisioning.propositionDisplay"
      }
    });
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo",
      "<div>Hola Mundo</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo2",
      "<div>here is a target activity</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo",
      "<div>Hola Mundo</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo2",
      "<div>here is a target activity</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledTimes(4);
    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

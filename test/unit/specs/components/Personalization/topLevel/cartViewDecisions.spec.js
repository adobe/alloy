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
import { CART_VIEW_DECISIONS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";
import resetMocks from "./resetMocks";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";

describe("PersonalizationComponent", () => {
  it("CART_VIEW_DECISIONS", async () => {
    const mocks = buildMocks(CART_VIEW_DECISIONS);
    const alloy = buildAlloy(mocks);
    let { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      CART_VIEW_DECISIONS
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
            "https://ns.adobe.com/personalization/message/feed-item",
            "https://ns.adobe.com/personalization/dom-action"
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"]
        }
      }
    });
    expect(result).toEqual({
      propositions: [],
      decisions: []
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();

    resetMocks(mocks);
    ({ event, result } = await alloy.sendEvent(
      {
        renderDecisions: true,
        xdm: {
          web: {
            webPageDetails: {
              viewName: "cart"
            }
          }
        }
      },
      []
    ));

    expect(event.toJSON()).toEqual({
      xdm: {
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "TNT:activity4:experience9",
                scope: "cart",
                scopeDetails: {
                  blah: "test",
                  characteristics: {
                    scopeType: "view"
                  }
                }
              }
            ],
            propositionEventType: {
              display: 1
            }
          }
        },
        web: {
          webPageDetails: {
            viewName: "cart"
          }
        }
      }
    });
    expect(result).toEqual({
      propositions: [
        {
          renderAttempted: true,
          id: "TNT:activity4:experience9",
          scope: "cart",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo",
                content: "<div>welcome to cart view</div>"
              }
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo2",
                content: "<div>here is a target activity for cart view</div>"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            }
          ],
          scopeDetails: {
            blah: "test",
            characteristics: {
              scopeType: "view"
            }
          }
        }
      ],
      decisions: []
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo",
      "<div>welcome to cart view</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo2",
      "<div>here is a target activity for cart view</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledTimes(2);
    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });

  it("CART_VIEW_DECISIONS 2", async () => {
    const mocks = buildMocks(CART_VIEW_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true,
        xdm: {
          web: {
            webPageDetails: {
              viewName: "cart"
            }
          }
        }
      },
      CART_VIEW_DECISIONS
    );

    await flushPromiseChains();

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
            "https://ns.adobe.com/personalization/message/feed-item",
            "https://ns.adobe.com/personalization/dom-action"
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"]
        }
      },
      xdm: {
        web: {
          webPageDetails: {
            viewName: "cart"
          }
        }
      }
    });
    expect(result).toEqual({
      propositions: [
        {
          renderAttempted: true,
          id: "TNT:activity4:experience9",
          scope: "cart",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo",
                content: "<div>welcome to cart view</div>"
              }
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "setHtml",
                selector: "#foo2",
                content: "<div>here is a target activity for cart view</div>"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            }
          ],
          scopeDetails: {
            blah: "test",
            characteristics: {
              scopeType: "view"
            }
          }
        }
      ],
      decisions: []
    });
    expect(mocks.sendEvent).toHaveBeenCalledWith({
      xdm: {
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "TNT:activity4:experience9",
                scope: "cart",
                scopeDetails: {
                  blah: "test",
                  characteristics: {
                    scopeType: "view"
                  }
                }
              }
            ],
            propositionEventType: {
              display: 1
            }
          }
        },
        eventType: "decisioning.propositionDisplay",
        web: {
          webPageDetails: {
            viewName: "cart"
          }
        }
      }
    });
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo",
      "<div>welcome to cart view</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledWith(
      "#foo2",
      "<div>here is a target activity for cart view</div>"
    );
    expect(mocks.actions.setHtml).toHaveBeenCalledTimes(2);
    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

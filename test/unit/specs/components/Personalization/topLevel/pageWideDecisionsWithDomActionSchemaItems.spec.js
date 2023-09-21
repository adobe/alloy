import { PAGE_WIDE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("PAGE_WIDE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS", async () => {
    const mocks = buildMocks(PAGE_WIDE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      PAGE_WIDE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(event.toJSON()).toEqual({
      query: {
        personalization: {
          schemas: [
            "https://ns.adobe.com/personalization/default-content-item",
            "https://ns.adobe.com/personalization/html-content-item",
            "https://ns.adobe.com/personalization/json-content-item",
            "https://ns.adobe.com/personalization/redirect-item",
            "https://ns.adobe.com/personalization/dom-action"
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"]
        }
      }
    });
    expect(result).toEqual({
      propositions: [
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

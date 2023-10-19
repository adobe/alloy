import { PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS", async () => {
    const mocks = buildMocks(
      PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
    );
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
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
      ],
      decisions: [
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
      ]
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

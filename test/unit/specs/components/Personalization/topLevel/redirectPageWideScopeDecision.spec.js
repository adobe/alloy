import { REDIRECT_PAGE_WIDE_SCOPE_DECISION } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("REDIRECT_PAGE_WIDE_SCOPE_DECISION", async () => {
    const mocks = buildMocks(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    const alloy = buildAlloy(mocks);
    const { event } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      REDIRECT_PAGE_WIDE_SCOPE_DECISION
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
    // No expectation on the result value because the page will redirect soon.
    expect(mocks.sendEvent).toHaveBeenCalledWith({
      xdm: {
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "TNT:activity15:experience1",
                scope: "__view__",
                scopeDetails: {
                  blah: "test"
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

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

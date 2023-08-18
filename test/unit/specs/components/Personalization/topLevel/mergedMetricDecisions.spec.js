import { MERGED_METRIC_DECISIONS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("MERGED_METRIC_DECISIONS", async () => {
    const mocks = buildMocks(MERGED_METRIC_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      MERGED_METRIC_DECISIONS
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
          id: "TNT:activity6:experience1",
          scope: "testScope",
          items: [
            {
              id: "0",
              schema: "https://ns.adobe.com/personalization/html-content-item",
              data: {
                id: "0",
                format: "text/html",
                content: "testScope content1"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            },
            {
              schema: "https://ns.adobe.com/personalization/measurement",
              data: {
                type: "click",
                format: "application/vnd.adobe.target.metric"
              }
            }
          ],
          scopeDetails: {
            eventTokens: {
              display: "displayToken1",
              click: "clickToken1"
            }
          }
        }
      ],
      decisions: [
        {
          id: "TNT:activity6:experience1",
          scope: "testScope",
          items: [
            {
              id: "0",
              schema: "https://ns.adobe.com/personalization/html-content-item",
              data: {
                id: "0",
                format: "text/html",
                content: "testScope content1"
              }
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item"
            },
            {
              schema: "https://ns.adobe.com/personalization/measurement",
              data: {
                type: "click",
                format: "application/vnd.adobe.target.metric"
              }
            }
          ],
          scopeDetails: {
            eventTokens: {
              display: "displayToken1",
              click: "clickToken1"
            }
          }
        }
      ]
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

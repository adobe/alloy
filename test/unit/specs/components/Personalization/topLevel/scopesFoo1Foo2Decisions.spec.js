import {
  SCOPES_FOO1_FOO2_DECISIONS
} from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks"
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {

  it("SCOPES_FOO1_FOO2_DECISIONS", async () => {
    const mocks = buildMocks(SCOPES_FOO1_FOO2_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      SCOPES_FOO1_FOO2_DECISIONS
    );
        expect(event.toJSON()).toEqual({
      "query": {
        "personalization": {
          "schemas": [
            "https://ns.adobe.com/personalization/default-content-item",
            "https://ns.adobe.com/personalization/html-content-item",
            "https://ns.adobe.com/personalization/json-content-item",
            "https://ns.adobe.com/personalization/redirect-item",
            "https://ns.adobe.com/personalization/dom-action"
          ],
          "decisionScopes": [
            "__view__"
          ],
          "surfaces": [
            "web://example.com/home"
          ]
        }
      }
    });
    expect(result).toEqual({
      "propositions": [
        {
          "renderAttempted": false,
          "id": "TNT:ABC:A",
          "scope": "Foo1",
          "items": [
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "1",
                "url": "https://foo.com/article/1",
                "thumbnailUrl": "https://foo.com/image/1?size=400x300"
              }
            },
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "2",
                "url": "https://foo.com/article/2",
                "thumbnailUrl": "https://foo.com/image/2?size=400x300"
              }
            },
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "3",
                "url": "https://foo.com/article/3",
                "thumbnailUrl": "https://foo.com/image/3?size=400x300"
              }
            }
          ],
          "scopeDetails": {
            "blah": "test"
          }
        },
        {
          "renderAttempted": false,
          "id": "TNT:ABC:A",
          "scope": "Foo2",
          "items": [
            {
              "schema": "https://ns.adove.com/experience/item",
              "data": {
                "id": "A",
                "content": "Banner A ...."
              }
            }
          ]
        }
      ],
      "decisions": [
        {
          "id": "TNT:ABC:A",
          "scope": "Foo1",
          "items": [
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "1",
                "url": "https://foo.com/article/1",
                "thumbnailUrl": "https://foo.com/image/1?size=400x300"
              }
            },
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "2",
                "url": "https://foo.com/article/2",
                "thumbnailUrl": "https://foo.com/image/2?size=400x300"
              }
            },
            {
              "schema": "https://ns.adove.com/experience/item-article",
              "data": {
                "id": "3",
                "url": "https://foo.com/article/3",
                "thumbnailUrl": "https://foo.com/image/3?size=400x300"
              }
            }
          ],
          "scopeDetails": {
            "blah": "test"
          }
        },
        {
          "id": "TNT:ABC:A",
          "scope": "Foo2",
          "items": [
            {
              "schema": "https://ns.adove.com/experience/item",
              "data": {
                "id": "A",
                "content": "Banner A ...."
              }
            }
          ]
        }
      ]
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

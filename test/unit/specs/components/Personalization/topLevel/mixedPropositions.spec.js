import {
  MIXED_PROPOSITIONS
} from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks"
import buildAlloy from "./buildAlloy";
import resetMocks from "./resetMocks";

describe("PersonalizationComponent", () => {

  fit("MIXED_PROPOSITIONS", async () => {
    const mocks = buildMocks(MIXED_PROPOSITIONS);
    const alloy = buildAlloy(mocks);
    let { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      MIXED_PROPOSITIONS
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
    console.log("result1", JSON.stringify(result, null, 2));
    expect(result.propositions).toEqual(jasmine.arrayWithExactContents([
        {
          "renderAttempted": true,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
          "scope": "__view__",
          "items": [
            {
              "id": "442358",
              "schema": "https://ns.adobe.com/personalization/dom-action",
              "data": {
                "type": "click",
                "format": "application/vnd.adobe.target.dom-action",
                "selector": "#root"
              }
            }
          ]
        },
        {
          "renderAttempted": true,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn2=",
          "scope": "__view__",
          "items": [
            {
              "id": "442379",
              "schema": "https://ns.adobe.com/personalization/dom-action",
              "data": {
                "type": "click",
                "format": "application/vnd.adobe.target.dom-action",
                "selector": "#root"
              }
            }
          ]
        },
        {
          "renderAttempted": false,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
          "scope": "home",
          "items": [
            {
              "id": "442359",
              "schema": "https://ns.adobe.com/personalization/html-content-item",
              "data": {
                "content": "<p>Some custom content for the home page</p>",
                "format": "text/html",
                "id": "1202448"
              }
            }
          ]
        },
        {
          "renderAttempted": false,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
          "scope": "home",
          "items": [
            {
              "id": "442360",
              "schema": "https://ns.adobe.com/personalization/json-content-item",
              "data": {
                "content": "{'field1': 'custom content'}",
                "format": "text/javascript",
                "id": "1202449"
              }
            }
          ]
        },
        {
          "renderAttempted": false,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiMTQxNjY0IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
          "scope": "home",
          "items": [
            {
              "id": "xcore:personalized-offer:134ce877e13a04ca",
              "etag": "4",
              "schema": "https://ns.adobe.com/experience/offer-management/content-component-html",
              "data": {
                "id": "xcore:personalized-offer:134ce877e13a04ca",
                "format": "text/html",
                "language": [
                  "en-us"
                ],
                "content": "<p>An html offer from Offer Decisioning</p>",
                "characteristics": {
                  "testing": "true"
                }
              }
            }
          ]
        },
        {
          "renderAttempted": false,
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
          "scope": "home",
          "items": [
            {
              "id": "442358",
              "schema": "https://ns.adobe.com/personalization/dom-action",
              "data": {
                "type": "click",
                "format": "application/vnd.adobe.target.dom-action",
                "selector": "#root"
              }
            }
          ]
        }
      ]));
      expect(result.decisions).toEqual(jasmine.arrayWithExactContents([
        {
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
          "scope": "home",
          "items": [
            {
              "id": "442359",
              "schema": "https://ns.adobe.com/personalization/html-content-item",
              "data": {
                "content": "<p>Some custom content for the home page</p>",
                "format": "text/html",
                "id": "1202448"
              }
            }
          ]
        },
        {
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
          "scope": "home",
          "items": [
            {
              "id": "442360",
              "schema": "https://ns.adobe.com/personalization/json-content-item",
              "data": {
                "content": "{'field1': 'custom content'}",
                "format": "text/javascript",
                "id": "1202449"
              }
            }
          ]
        },
        {
          "id": "AT:eyJhY3Rpdml0eUlkIjoiMTQxNjY0IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
          "scope": "home",
          "items": [
            {
              "id": "xcore:personalized-offer:134ce877e13a04ca",
              "etag": "4",
              "schema": "https://ns.adobe.com/experience/offer-management/content-component-html",
              "data": {
                "id": "xcore:personalized-offer:134ce877e13a04ca",
                "format": "text/html",
                "language": [
                  "en-us"
                ],
                "content": "<p>An html offer from Offer Decisioning</p>",
                "characteristics": {
                  "testing": "true"
                }
              }
            }
          ]
        },
        {
          "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
          "scope": "home",
          "items": [
            {
              "id": "442358",
              "schema": "https://ns.adobe.com/personalization/dom-action",
              "data": {
                "type": "click",
                "format": "application/vnd.adobe.target.dom-action",
                "selector": "#root"
              }
            }
          ]
        }
      ]));
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();

    resetMocks(mocks);
    result = await alloy.applyPropositions({
      propositions: result.propositions,
      metadata: {
        home: {
          selector: "#myhomeselector",
          actionType: "appendHtml"
        }
      }
    });
    console.log(JSON.stringify(result.propositions, null, 2));
    expect(result.propositions).toEqual([
      {
        "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
        "scope": "home",
        "items": [
          {
            "id": "442358",
            "schema": "https://ns.adobe.com/personalization/dom-action",
            "data": {
              "type": "click",
              "format": "application/vnd.adobe.target.dom-action",
              "selector": "#root"
            }
          }
        ],
        "renderAttempted": true,
        scopeDetails: undefined
      },
      {
        "id": "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        "scope": "home",
        "items": [
          {
            "id": "442359",
            "schema": "https://ns.adobe.com/personalization/html-content-item",
            "data": {
              "content": "<p>Some custom content for the home page</p>",
              "format": "text/html",
              "id": "1202448",
              "selector": "#myhomeselector",
              "type": "appendHtml"
            }
          }
        ],
        "renderAttempted": true,
        scopeDetails: undefined
      }
    ]);
    console.log(JSON.stringify(result.decisions, null, 2));
    expect(result.decisions).toBeUndefined();

    expect(mocks.sendEvent).not.toHaveBeenCalled();
    expect(mocks.actions.appendHtml).toHaveBeenCalledOnceWith(
      "#myhomeselector",
      "<p>Some custom content for the home page</p>"
    );
    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

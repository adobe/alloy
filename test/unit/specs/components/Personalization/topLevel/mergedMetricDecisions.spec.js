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
import { MERGED_METRIC_DECISIONS } from "../responsesMock/eventResponses.js";

import buildMocks from "./buildMocks.js";
import buildAlloy from "./buildAlloy.js";

describe("PersonalizationComponent", () => {
  it("MERGED_METRIC_DECISIONS", async () => {
    const mocks = buildMocks(MERGED_METRIC_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true,
      },
      MERGED_METRIC_DECISIONS,
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
            "https://ns.adobe.com/personalization/dom-action",
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"],
        },
      },
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
                content: "testScope content1",
              },
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item",
            },
            {
              schema: "https://ns.adobe.com/personalization/measurement",
              data: {
                type: "click",
                format: "application/vnd.adobe.target.metric",
              },
            },
          ],
          scopeDetails: {
            eventTokens: {
              display: "displayToken1",
              click: "clickToken1",
            },
          },
        },
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
                content: "testScope content1",
              },
            },
            {
              schema:
                "https://ns.adobe.com/personalization/default-content-item",
            },
            {
              schema: "https://ns.adobe.com/personalization/measurement",
              data: {
                type: "click",
                format: "application/vnd.adobe.target.metric",
              },
            },
          ],
          scopeDetails: {
            eventTokens: {
              display: "displayToken1",
              click: "clickToken1",
            },
          },
        },
      ],
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

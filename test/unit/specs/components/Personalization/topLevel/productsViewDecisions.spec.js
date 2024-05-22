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
import { PRODUCTS_VIEW_DECISIONS } from "../responsesMock/eventResponses";

import buildMocks from "./buildMocks";
import buildAlloy from "./buildAlloy";

describe("PersonalizationComponent", () => {
  it("PRODUCTS_VIEW_DECISIONS", async () => {
    const mocks = buildMocks(PRODUCTS_VIEW_DECISIONS);
    const alloy = buildAlloy(mocks);
    const { event, result } = await alloy.sendEvent(
      {
        renderDecisions: true
      },
      PRODUCTS_VIEW_DECISIONS
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
    expect(result).toEqual({
      propositions: [],
      decisions: []
    });
    expect(mocks.sendEvent).not.toHaveBeenCalled();

    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

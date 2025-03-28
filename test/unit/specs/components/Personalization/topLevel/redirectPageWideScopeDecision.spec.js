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
import { describe, it, expect } from "vitest";
import { REDIRECT_PAGE_WIDE_SCOPE_DECISION } from "../responsesMock/eventResponses.js";
import buildMocks from "./buildMocks.js";
import buildAlloy from "./buildAlloy.js";

describe("PersonalizationComponent", () => {
  it("REDIRECT_PAGE_WIDE_SCOPE_DECISION", async () => {
    const mocks = buildMocks(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    const alloy = buildAlloy(mocks);
    const { event } = await alloy.sendEvent(
      {
        renderDecisions: true,
      },
      REDIRECT_PAGE_WIDE_SCOPE_DECISION,
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
            "https://ns.adobe.com/personalization/dom-action",
          ],
          decisionScopes: ["__view__"],
          surfaces: ["web://example.com/home"],
        },
      },
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
                  blah: "test",
                },
              },
            ],
            propositionEventType: {
              display: 1,
            },
          },
        },
        eventType: "decisioning.propositionDisplay",
      },
    });
    expect(mocks.logger.warn).not.toHaveBeenCalled();
    expect(mocks.logger.error).not.toHaveBeenCalled();
  });
});

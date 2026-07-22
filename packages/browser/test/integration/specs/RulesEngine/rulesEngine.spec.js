/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  test,
  expect,
  describe,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { inAppMessageHandler } from "../../helpers/mswjs/handlers.js";
import inAppMessageResponse from "../../helpers/mocks/inAppMessageResponse.json";
import rulesEngineEvaluateResponse from "../../helpers/mocks/rulesEngineEvaluateResponse.json";

const expectDisplayNotification = async (networkRecorder, minCalls = 1) => {
  const calls = await networkRecorder.findCalls(/v1\/interact/, {
    retries: 30,
    delayMs: 100,
    minCalls,
  });

  expect(
    calls.some(
      (call) =>
        call.request.body?.events?.[0]?.xdm?.eventType ===
        "decisioning.propositionDisplay",
    ),
  ).toBe(true);
};

describe("RulesEngine", () => {
  beforeEach(() => {
    document.getElementById("alloy-messaging-container")?.remove();
    document.getElementById("alloy-overlay-container")?.remove();
  });

  // onBeforeEvent sets ~type="com.adobe.eventType.edge" → inAppMessageResponse condition matches
  test("C13419240 - Verify DOM action using the sendEvent command", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(inAppMessageHandler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    const container = document.getElementById("alloy-messaging-container");
    await expect.element(container).toBeInTheDocument();
    expect(container.innerHTML).toContain("alloy-content-iframe");
    await expectDisplayNotification(networkRecorder, 2);
  });

  // applyResponse also triggers onBeforeEvent with ~type=edge.
  test("C13348429 - Verify DOM action using the applyResponse command", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(inAppMessageHandler);
    await alloy("configure", alloyConfig);

    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody: inAppMessageResponse,
    });

    const container = document.getElementById("alloy-messaging-container");
    await expect.element(container).toBeInTheDocument();
    expect(container.innerHTML).toContain("alloy-content-iframe");
    await expectDisplayNotification(networkRecorder);
  });

  // evaluateRulesets uses ~type=rulesEngine (not edge); applyResponse stores ruleset, then evaluateRulesets renders
  test("C13405889 - Verify DOM action using the evaluateRulesets command", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(inAppMessageHandler);
    await alloy("configure", alloyConfig);

    await alloy("applyResponse", {
      renderDecisions: false,
      responseBody: rulesEngineEvaluateResponse,
    });

    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: {
        decisionContext: { user: "alloy" },
      },
    });

    const container = document.getElementById("alloy-messaging-container");
    await expect.element(container).toBeInTheDocument();
    expect(container.innerHTML).toContain("alloy-content-iframe");
    await expectDisplayNotification(networkRecorder);
  });
});

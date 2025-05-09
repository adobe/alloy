/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import alloyConfig from "../../helpers/alloy/config.js";
import { describe, test, expect } from "../../helpers/testsSetup/extend.js";
import { inAppMessageHandler } from "../../helpers/mswjs/handlers.js";

describe("AJO In-App Messages", () => {
  test("are rendered correctly and with the correct styles applied", async ({
    worker,
    alloy,
  }) => {
    worker.use(inAppMessageHandler);

    alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    const messageContainerLocator = document.getElementById(
      "alloy-messaging-container",
    );
    await expect.element(messageContainerLocator).toBeInTheDocument();

    expect(messageContainerLocator.style.width).toBe("55%");

    document.body.removeChild(messageContainerLocator);
    document.body.removeChild(
      document.getElementById("alloy-overlay-container"),
    );
  });
});

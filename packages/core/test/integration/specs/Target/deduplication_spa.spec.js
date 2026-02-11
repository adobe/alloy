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

import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  customCodeHandler,
  prependHtmlHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import waitFor from "../../helpers/utils/waitFor.js";

describe("Target Custom Code SPA", () => {
  test("custom code runs twice when sendEvent is called twice with renderDecisions and viewName", async ({
    alloy,
    worker,
  }) => {
    // Counter to track custom code executions
    window.customCodeExecutionCount = 0;

    // Use the custom code handler
    worker.use(customCodeHandler);

    // Configure Alloy
    await alloy("configure", alloyConfig);

    // First sendEvent call
    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName: "home",
          },
        },
      },
    });

    // Verify custom code ran once after first call
    expect(window.customCodeExecutionCount).toBe(1);

    await waitFor(50);

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName: "home",
          },
        },
      },
    });

    // Verify custom code ran twice - once from first response,
    // and once from cached/persisted offers on second call
    expect(window.customCodeExecutionCount).toBe(2);

    // Clean up
    delete window.customCodeExecutionCount;
  });

  test("prependHtml action only renders once when sendEvent is called twice with renderDecisions and viewName", async ({
    alloy,
    worker,
  }) => {
    // Use the prependHtml handler
    worker.use(prependHtmlHandler);

    // Configure Alloy
    await alloy("configure", alloyConfig);

    // First sendEvent call
    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName: "home",
          },
        },
      },
    });

    // Verify the element was prepended once
    let prependedElements = document.querySelectorAll(
      '[data-test-id="prepended-content"]',
    );
    expect(prependedElements.length).toBe(1);
    expect(prependedElements[0].textContent).toBe("Prepended Content");

    // Second sendEvent call (simulating SPA navigation back to same view)
    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName: "home",
          },
        },
      },
    });

    // Verify the element was NOT prepended again (still only 1 element)
    prependedElements = document.querySelectorAll(
      '[data-test-id="prepended-content"]',
    );
    expect(prependedElements.length).toBe(1);
    expect(prependedElements[0].textContent).toBe("Prepended Content");

    // Clean up
    prependedElements.forEach((el) => el.remove());
  });
});

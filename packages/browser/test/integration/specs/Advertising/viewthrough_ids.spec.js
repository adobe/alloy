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

import { test, describe, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  createAdvertisingConfig,
  findViewThroughCalls,
  validateViewThroughCall,
  ADVERTISING_CONSTANTS,
} from "../../helpers/advertising.js";
import waitFor from "../../helpers/utils/waitFor.js";

describe("Advertising - Viewthrough with advertising IDs", () => {
  test("should send conversion query with advertising IDs in view-through", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig({}),
    });

    await alloy("sendEvent", {
      advertising: { handleAdvertisingData: "auto" },
    });

    // The view-through call comes from one of two racing paths:
    //   A) The fire-and-forget `handleViewThrough` chain kicked off in
    //      `onComponentsRegistered` (sets `xdm.eventType: "advertising.enrichment"`).
    //   B) The current `sendEvent` getting `query.advertising` appended by the
    //      `onBeforeSendEvent` hook.
    // In CI, when the SurferID iframe at pixel.everesttech.net responds quickly,
    // path A's `markIdsAsConverted` can flip SURFER_ID's throttle cookie before
    // path B's throttle check runs, making path B early-return without adding
    // `query.advertising`. Then we depend solely on A — but the default
    // `findCalls` exits on the first complete call (usually the sendEvent), which
    // can happen before A's response body is captured. Poll for a call that
    // actually matches the view-through shape instead.
    let firstView;
    for (let i = 0; i < 100 && !firstView; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
        retries: 1,
        delayMs: 0,
      });
      [firstView] = findViewThroughCalls(calls);
      if (!firstView) {
        // eslint-disable-next-line no-await-in-loop
        await waitFor(100);
      }
    }
    expect(firstView).toBeTruthy();

    validateViewThroughCall(firstView, {
      advIds: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
      requireIds: false,
    });
  });
});

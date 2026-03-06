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
  findClickThroughCall,
  validateClickThroughCall,
} from "../../helpers/advertising.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";

describe("Advertising - Clickthrough (ef_id)", () => {
  test("should send advertising.enrichment_ct when ef_id is present", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    // Simulate URL param BEFORE configure so component startup can detect it
    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.set("ef_id", "test_experiment_456");
      applyUrl(url);

      await alloy("configure", {
        ...alloyConfig,
        ...createAdvertisingConfig(),
      });

      await alloy("sendEvent");

      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
      const conversionCall = findClickThroughCall(calls);
      expect(conversionCall).toBeTruthy();
      validateClickThroughCall(conversionCall, {
        experimentId: "test_experiment_456",
      });
    });
  });
});

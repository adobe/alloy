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
  findViewThroughCalls,
} from "../../helpers/advertising.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";

const conversionXdm = (call) => call.request.body.events[0].xdm;

const sendClickThrough = async ({ alloy, networkRecorder, config }) => {
  let conversionCall;
  await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
    const url = new URL(currentHref);
    url.searchParams.set("s_kwcid", "test_keyword_123");
    applyUrl(url);

    await alloy("configure", { ...config, ...createAdvertisingConfig() });
    await alloy("sendEvent");

    conversionCall = findClickThroughCall(
      await networkRecorder.findCalls(/edge\.adobedc\.net/),
    );
  });
  return conversionCall;
};

describe("Advertising - timestamp", () => {
  test("click-through conversion carries the client time by default", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const call = await sendClickThrough({
      alloy,
      networkRecorder,
      config: alloyConfig,
    });

    expect(conversionXdm(call).timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("click-through conversion leaves the timestamp out with serverSideTimestamp", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const call = await sendClickThrough({
      alloy,
      networkRecorder,
      config: { ...alloyConfig, context: ["serverSideTimestamp"] },
    });

    expect(conversionXdm(call)).not.toHaveProperty("timestamp");
  });

  test("view-through conversion leaves the timestamp out with serverSideTimestamp", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      context: ["serverSideTimestamp"],
      ...createAdvertisingConfig({}),
    });
    await alloy("sendEvent", {
      advertising: { handleAdvertisingData: "auto" },
    });

    const getFirstViewThrough = async () =>
      findViewThroughCalls(
        await networkRecorder.findCalls(/edge\.adobedc\.net/, { retries: 1 }),
      )[0];
    await expect
      .poll(getFirstViewThrough, { timeout: 5000, interval: 100 })
      .toBeTruthy();

    expect(conversionXdm(await getFirstViewThrough())).not.toHaveProperty(
      "timestamp",
    );
  });
});

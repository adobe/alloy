/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
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

    await waitFor(200);

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      retries: 20,
      delayMs: 100,
    });
    const [firstView] = findViewThroughCalls(calls);
    expect(firstView).toBeTruthy();

    validateViewThroughCall(firstView, {
      advIds: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
      requireIds: false,
    });
  });
});

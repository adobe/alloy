/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
*/
import { test, describe, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  createAdvertisingConfig,
  findClickThroughCall,
  validateClickThroughCall,
} from "../../helpers/advertising.js";

describe("Advertising - Clickthrough (ef_id)", () => {
  test("should send advertising.enrichment_ct when ef_id is present", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    // Simulate URL param BEFORE configure so component startup can detect it
    const url = new URL(window.location.href);
    url.searchParams.set("ef_id", "test_experiment_456");
    window.history.replaceState({}, "", url.toString());

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

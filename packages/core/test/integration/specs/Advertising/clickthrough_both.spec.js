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

describe("Advertising - Clickthrough (both)", () => {
  test("should send advertising.enrichment_ct when both s_kwcid and ef_id are present", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const url = new URL(window.location.href);
    url.searchParams.set("s_kwcid", "test_keyword_123");
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
      sampleGroupId: "test_keyword_123",
      experimentId: "test_experiment_456",
    });
  });

  test("should handle duplicate s_kwcid values by using the first value", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const url = new URL(window.location.href);
    url.searchParams.append("s_kwcid", "AL!first-keyword");
    url.searchParams.append("s_kwcid", "AL!second-keyword");
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
      sampleGroupId: "AL!first-keyword",
      experimentId: "test_experiment_456",
    });
  });
});

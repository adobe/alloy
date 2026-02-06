/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
*/
import { test, describe, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  createAdvertisingConfig,
  ADVERTISING_CONSTANTS,
} from "../../helpers/advertising.js";

const getNamespacedAdvertisingCookieName = () => {
  const sanitizedOrg = alloyConfig.orgId.replace("@", "_");
  return `kndctr_${sanitizedOrg}_advertising`;
};

const setAdvertisingCookie = (value) => {
  const name = getNamespacedAdvertisingCookieName();
  document.cookie = `${name}=${value}; path=/`;
};

describe("Advertising - Modes (auto, wait, disabled)", () => {
  test("auto mode should append cookie data immediately", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const advertisingCookieData = {
      _les_lsc: { click_time: Date.now(), skwcid: "123", efid: "111" },
      lastConversionTime: Date.now(),
      surferId:
        ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID || "sample-surfer-id-12345",
      ev_lcc: "__LCC__",
    };
    setAdvertisingCookie(
      encodeURIComponent(JSON.stringify(advertisingCookieData)),
    );

    await alloy("configure", { ...alloyConfig, ...createAdvertisingConfig() });

    await alloy("sendEvent", {
      xdm: { eventType: "web.webpagedetails.pageViews" },
      advertising: { handleAdvertisingData: "auto" },
    });

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      retries: 5,
      delayMs: 50,
    });
    const foundWithSurfer = calls.some((call) => {
      const body =
        typeof call.request.body === "string"
          ? JSON.parse(call.request.body)
          : call.request.body;
      const adv = body?.events?.[0]?.query?.advertising;
      return (
        adv?.stitchIds?.surferId ===
        (ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID || "sample-surfer-id-12345")
      );
    });
    expect(foundWithSurfer).toBe(true);
  });

  test("wait mode should still send page view event", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", { ...alloyConfig, ...createAdvertisingConfig() });

    await alloy("sendEvent", {
      xdm: { eventType: "web.webpagedetails.pageViews" },
      advertising: { handleAdvertisingData: "wait" },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    const body =
      typeof call.request.body === "string"
        ? JSON.parse(call.request.body)
        : call.request.body;
    expect(body?.events?.length >= 1).toBe(true);
  });

  test("disabled mode should not include advertising stitchIds", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", { ...alloyConfig, ...createAdvertisingConfig() });

    const advertisingCookieData = {
      surferId:
        ADVERTISING_CONSTANTS.SAMPLE_SURFER_ID || "sample-surfer-id-12345",
      lastConversionTime: Date.now(),
    };
    setAdvertisingCookie(
      encodeURIComponent(JSON.stringify(advertisingCookieData)),
    );

    await alloy("sendEvent", {
      xdm: { eventType: "web.webpagedetails.pageViews" },
      advertising: { handleAdvertisingData: "disabled" },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    const body =
      typeof call.request.body === "string"
        ? JSON.parse(call.request.body)
        : call.request.body;
    const advertising = body?.events?.[0]?.query?.advertising;
    const stitchIds = advertising?.stitchIds;
    if (stitchIds) {
      const hasAny = Object.keys(stitchIds).some(
        (k) => k !== "ipAddress" && stitchIds[k],
      );
      expect(hasAny).toBe(false);
    } else {
      expect(stitchIds).toBeFalsy();
    }
  });
});

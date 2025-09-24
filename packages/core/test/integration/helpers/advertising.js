/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
*/

import { expect } from "./testsSetup/extend.js";

export const ADVERTISING_CONSTANTS = Object.freeze({
  DEFAULT_ADVERTISER_SETTINGS: [
    { advertiserId: "83565", enabled: true },
    { advertiserId: "83567", enabled: true },
    { advertiserId: "83569", enabled: true },
  ],
  DEFAULT_ADVERTISER_IDS_STRING: "83565, 83567, 83569",
  EVENT_TYPES: {
    CLICK_THROUGH: "advertising.enrichment_ct",
    VIEW_THROUGH: "advertising.enrichment",
  },
  EXPERIENCE_STRING: "_experience",
});

export const createAdvertisingConfig = ({
  advertiserSettings = ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_SETTINGS,
  id5PartnerId,
  rampIdJSPath,
  dspEnabled = true,
} = {}) => ({
  advertising: {
    ...(advertiserSettings && { advertiserSettings }),
    ...(id5PartnerId && { id5PartnerId }),
    ...(rampIdJSPath && { rampIdJSPath }),
    dspEnabled,
  },
});

const getRequestBody = (call) => {
  const body = call?.request?.body;
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

export const findClickThroughCall = (calls) =>
  calls.find((call) => {
    const body = getRequestBody(call);
    const event = body.events?.[0];
    return (
      event?.xdm?.eventType === ADVERTISING_CONSTANTS.EVENT_TYPES.CLICK_THROUGH
    );
  });

export const findViewThroughCalls = (calls) =>
  calls.filter((call) => {
    const body = getRequestBody(call);
    const event = body.events?.[0];
    const hasAdvertisingQuery = !!event?.query?.advertising;
    const hasViewThroughEventType =
      event?.xdm?.eventType === ADVERTISING_CONSTANTS.EVENT_TYPES.VIEW_THROUGH;
    return hasAdvertisingQuery || hasViewThroughEventType;
  });

export const validateClickThroughCall = (call, expected = {}) => {
  const body = getRequestBody(call);
  expect(Array.isArray(body.events) && body.events.length >= 1).toBe(true);

  const event = body.events[0];
  expect(event?.xdm?.eventType).toBe(
    ADVERTISING_CONSTANTS.EVENT_TYPES.CLICK_THROUGH,
  );

  const adCloud =
    event?.xdm?.[ADVERTISING_CONSTANTS.EXPERIENCE_STRING]?.adcloud;
  expect(adCloud).toBeTruthy();

  const conversionDetails = adCloud?.conversionDetails;
  expect(conversionDetails).toBeTruthy();

  if (expected.sampleGroupId !== undefined) {
    expect(conversionDetails.trackingCode).toBe(expected.sampleGroupId);
  }
  if (expected.experimentId !== undefined) {
    expect(conversionDetails.trackingIdentities).toBe(expected.experimentId);
  }
};

export const validateViewThroughCall = (call, expected = {}) => {
  const body = getRequestBody(call);
  expect(Array.isArray(body.events) && body.events.length >= 1).toBe(true);

  const event = body.events[0];
  const conv = event?.query?.advertising;
  expect(conv).toBeTruthy();

  if (expected.advIds !== undefined) {
    expect(conv.advIds).toBe(expected.advIds);
  }

  if (expected.requireIds !== false) {
    const ids = conv.stitchIds || {};
    expect(Boolean(ids.surferId || ids.id5 || ids.rampIDEnv)).toBe(true);
  }
};

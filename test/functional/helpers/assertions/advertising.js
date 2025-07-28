/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
*/
import { t } from "testcafe";

// Constants
export const ADVERTISING_CONSTANTS = Object.freeze({
  DEFAULT_ADVERTISER_SETTINGS: [
    { advertiserId: "83565", enabled: true },
    { advertiserId: "83567", enabled: true },
    { advertiserId: "83569", enabled: true },
  ],
  DEFAULT_ADVERTISER_IDS_STRING: "83565, 83567, 83569",
  DEFAULT_TIMEOUT: 15000,
  EVENT_TYPES: { CLICK_THROUGH: "advertising.clickThrough" },
  ID5_PARTNER_ID: "173",
  RAMP_ID_JS_PATH: "https://cdn.jsdelivr.net/npm/@liveramp/ats@2/ats.min.js",
  EXPERIENCE_STRING: "_experience",
});

// Helpers
const parseBody = (req) => {
  try {
    return JSON.parse(req?.request?.body) || {};
  } catch {
    return {};
  }
};

const expectPath = async (obj, path, msg) => {
  const val = path.split(".").reduce((o, k) => o?.[k], obj);
  await t.expect(val).ok(msg);
};

// Config builder
export const createAdvertisingConfig = ({
  advertiserSettings = ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_SETTINGS,
  id5PartnerId,
  rampIdJSPath,
} = {}) => ({
  advertising: {
    ...(advertiserSettings && { advertiserSettings }),
    ...(id5PartnerId && { id5PartnerId }),
    ...(rampIdJSPath && { rampIdJSPath }),
  },
});

// Finders
export const findClickThroughRequest = (requests) =>
  requests.find((req) => {
    const body = parseBody(req);
    const event = body.events?.[0];

    const xdm = event?.xdm;
    const experience = xdm && xdm[ADVERTISING_CONSTANTS.EXPERIENCE_STRING];
    const adCloudEventType = experience?.adCloud?.eventType;

    return adCloudEventType === ADVERTISING_CONSTANTS.EVENT_TYPES.CLICK_THROUGH;
  }) || null;

export const findViewThroughRequests = (requests) =>
  requests.filter((req) => !!parseBody(req).events?.[0]?.query?.advertising);

// Validator for click-through
export const validateClickThroughRequest = async (req, expected) => {
  const body = parseBody(req);
  await expectPath(body, "events", "Missing events");

  await t.expect(body.events.length).gte(1, "No events");

  const adCloud =
    body.events[0]?.xdm?.[ADVERTISING_CONSTANTS.EXPERIENCE_STRING]?.adCloud;
  await t.expect(adCloud).ok("Missing adCloud");

  const campaign = adCloud.campaign;
  await t.expect(campaign).ok("Missing campaign");

  // Handle expected.accountId as string or array
  if (Array.isArray(expected.accountId)) {
    const actualIds =
      campaign.advIds ||
      (typeof campaign.accountId === "string" &&
        campaign.accountId.split(/\s*,\s*/)) ||
      [];
    await t.expect(actualIds).eql(expected.accountId, "accountId mismatch");
  } else {
    // string comparison
    const actualAccountId =
      campaign.accountId ||
      (Array.isArray(campaign.advIds) && campaign.advIds.join(", "));
    await t
      .expect(actualAccountId)
      .eql(expected.accountId, "accountId mismatch");
  }

  if (expected.sampleGroupId)
    await t
      .expect(campaign.sampleGroupId)
      .eql(expected.sampleGroupId, "sampleGroupId mismatch");
  if (expected.experimentId)
    await t
      .expect(campaign.experimentId)
      .eql(expected.experimentId, "experimentId mismatch");
};

// Validator for view-through
export const validateViewThroughRequest = async (req, expected) => {
  const body = parseBody(req);
  await expectPath(body, "events", "Missing events");
  await t.expect(body.events.length).gte(1, "No events");

  const conv = body.events[0]?.query?.advertising;
  await t.expect(conv).ok("Missing advertising query");

  await t.expect(conv.advIds).eql(expected.advIds, "advIds mismatch");

  if (expected.requireIds !== false) {
    const ids = conv.stitchIds || {};
    await t.expect(ids.surferId || ids.id5 || ids.rampIDEnv).ok("No IDs");
  }

  if (conv.lastDisplayClick)
    await t.expect(typeof conv.lastDisplayClick).eql("string");
  if (conv.lastSearchClick)
    await t.expect(typeof conv.lastSearchClick).eql("number");
};

// Best request selector
export const findBestRequestWithAdvertisingIds = (requests) => {
  const viewReqs = findViewThroughRequests(requests);
  if (viewReqs.length === 0) {
    return null;
  }

  let best = null;
  let max = 0;

  viewReqs.forEach((r) => {
    const stitch =
      parseBody(r).events?.[0]?.query?.advertising?.stitchIds || {};
    const count = ["surferId", "id5", "rampIDEnv"].reduce(
      (sum, key) => sum + (stitch[key] ? 1 : 0),
      0,
    );
    if (count > max) {
      max = count;
      best = r;
    }
  });

  // Always return at least the first request, with whatever maxIds we found
  return {
    bestRequest: best || viewReqs[0],
    maxIds: max,
  };
};

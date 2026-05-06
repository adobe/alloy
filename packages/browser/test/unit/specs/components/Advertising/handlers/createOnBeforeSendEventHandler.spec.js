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

import { vi, beforeEach, describe, it, expect } from "vitest";
import { CHROME } from "@adobe/alloy-core/constants/browser.js";
import createOnBeforeSendEventHandler from "../../../../../../src/components/Advertising/handlers/createOnBeforeSendEventHandler.js";
import { normalizeAdvertiser as realNormalizeAdvertiser } from "../../../../../../src/components/Advertising/utils/helpers.js";

describe("Advertising::createOnBeforeSendEventHandler", () => {
  let cookieManager;
  let logger;
  let event;
  let componentConfig;
  let getBrowser;
  let consent;
  let onBeforeEvent;
  let collectSurferIdFn;
  let getID5IdFn;
  let getRampIdFn;
  let appendAdvertisingIdQueryToEventFn;
  let getUrlParamsFn;
  let isThrottledFn;
  let normalizeAdvertiserFn;

  beforeEach(() => {
    cookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
    };

    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    event = {
      mergeQuery: vi.fn(),
      mergeXdm: vi.fn(),
    };

    componentConfig = {
      id5PartnerId: "test-partner",
      rampIdJSPath: "/test-path",
    };

    getBrowser = vi.fn(() => "Firefox");

    consent = {
      current: vi.fn(() => ({ state: "in", wasSet: true })),
    };

    collectSurferIdFn = vi.fn().mockResolvedValue(null);
    getID5IdFn = vi.fn().mockResolvedValue(null);
    getRampIdFn = vi.fn().mockResolvedValue(null);
    getUrlParamsFn = vi.fn().mockReturnValue({ skwcid: null, efid: null });
    appendAdvertisingIdQueryToEventFn = vi.fn((availableIds, currentEvent) => {
      const query = {
        advertising: {
          conversion: {
            StitchIds: {},
          },
        },
      };

      if (availableIds.surferId) {
        query.advertising.conversion.StitchIds.SurferId = availableIds.surferId;
      }
      if (availableIds.id5Id) {
        query.advertising.conversion.StitchIds.ID5 = availableIds.id5Id;
      }
      if (availableIds.rampId) {
        query.advertising.conversion.StitchIds.RampIDEnv = availableIds.rampId;
      }

      currentEvent.mergeQuery(query);
    });
    getUrlParamsFn = vi.fn().mockReturnValue({ skwcid: null, efid: null });
    isThrottledFn = vi.fn().mockReturnValue(false);
    // Default to a truthy advertiser id so the new "no advertiser" gate
    // does not short-circuit the existing tests. Individual tests can
    // override this via `normalizeAdvertiserFn.mockReturnValueOnce("")`.
    normalizeAdvertiserFn = vi.fn().mockReturnValue("adv-1");

    onBeforeEvent = createOnBeforeSendEventHandler({
      cookieManager,
      logger,
      componentConfig,
      getBrowser,
      consent,
      collectSurferId: collectSurferIdFn,
      getID5Id: getID5IdFn,
      getRampId: getRampIdFn,
      appendAdvertisingIdQueryToEvent: appendAdvertisingIdQueryToEventFn,
      appendAdCloudIdentityToEvent: vi.fn(),
      collectHashedIPAddr: vi.fn().mockResolvedValue(""),
      getUrlParams: getUrlParamsFn,
      isThrottled: isThrottledFn,
      normalizeAdvertiser: normalizeAdvertiserFn,
    });
  });

  it("returns early when consent is not in", async () => {
    consent.current.mockReturnValue({ state: "out", wasSet: true });

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(collectSurferIdFn).not.toHaveBeenCalled();
    expect(getID5IdFn).not.toHaveBeenCalled();
    expect(getRampIdFn).not.toHaveBeenCalled();
    expect(event.mergeQuery).not.toHaveBeenCalled();
  });

  it("returns early when advertising handling is disabled", async () => {
    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "disabled" },
    });

    expect(collectSurferIdFn).not.toHaveBeenCalled();
    expect(getID5IdFn).not.toHaveBeenCalled();
    expect(getRampIdFn).not.toHaveBeenCalled();
  });

  it("uses short timeout when handleAdvertisingData is wait", async () => {
    collectSurferIdFn.mockResolvedValue("test-surfer-id");

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "wait" },
    });

    expect(collectSurferIdFn).toHaveBeenCalledWith(true);
    expect(getID5IdFn).toHaveBeenCalledWith(logger, "test-partner", true, true);
    expect(getRampIdFn).toHaveBeenCalledWith(
      logger,
      "/test-path",
      cookieManager,
      true,
      true,
    );
  });

  it("collects and merges available IDs", async () => {
    collectSurferIdFn.mockResolvedValue("test-surfer-id");
    getID5IdFn.mockResolvedValue("test-id5-id");
    getRampIdFn.mockResolvedValue("test-ramp-id");

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(event.mergeQuery).toHaveBeenCalledWith({
      advertising: {
        conversion: {
          StitchIds: {
            SurferId: "test-surfer-id",
            ID5: "test-id5-id",
            RampIDEnv: "test-ramp-id",
          },
        },
      },
    });
  });

  it("skips RampID in Chrome", async () => {
    getBrowser.mockReturnValue(CHROME);
    collectSurferIdFn.mockResolvedValue("test-surfer-id");

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(getRampIdFn).not.toHaveBeenCalled();
  });

  it("returns early for click-through events", async () => {
    getUrlParamsFn.mockReturnValue({ skwcid: "a", efid: "b" });

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(collectSurferIdFn).not.toHaveBeenCalled();
    expect(getID5IdFn).not.toHaveBeenCalled();
    expect(getRampIdFn).not.toHaveBeenCalled();
  });

  it("returns early when all IDs are throttled", async () => {
    isThrottledFn.mockReturnValue(true);

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(collectSurferIdFn).not.toHaveBeenCalled();
    expect(getID5IdFn).not.toHaveBeenCalled();
    expect(getRampIdFn).not.toHaveBeenCalled();
  });

  describe("activeAdvertiserIds gate", () => {
    // Build a handler that uses the real normalizeAdvertiser so each test
    // exercises a genuinely different advertiserSettings shape end-to-end.
    const buildHandlerWith = (componentConfigOverride) =>
      createOnBeforeSendEventHandler({
        cookieManager,
        logger,
        componentConfig: componentConfigOverride,
        getBrowser,
        consent,
        collectSurferId: collectSurferIdFn,
        getID5Id: getID5IdFn,
        getRampId: getRampIdFn,
        appendAdvertisingIdQueryToEvent: appendAdvertisingIdQueryToEventFn,
        appendAdCloudIdentityToEvent: vi.fn(),
        collectHashedIPAddr: vi.fn().mockResolvedValue(""),
        getUrlParams: getUrlParamsFn,
        isThrottled: isThrottledFn,
        normalizeAdvertiser: realNormalizeAdvertiser,
      });

    it("returns early when advertiserSettings is missing", async () => {
      const handler = buildHandlerWith({
        id5PartnerId: "test-partner",
        rampIdJSPath: "/test-path",
      });

      await handler({
        event,
        advertising: { handleAdvertisingData: "auto" },
      });

      expect(collectSurferIdFn).not.toHaveBeenCalled();
      expect(getID5IdFn).not.toHaveBeenCalled();
      expect(getRampIdFn).not.toHaveBeenCalled();
      expect(event.mergeQuery).not.toHaveBeenCalled();
    });

    it("returns early when advertiserSettings is an empty array", async () => {
      const handler = buildHandlerWith({
        id5PartnerId: "test-partner",
        rampIdJSPath: "/test-path",
        advertiserSettings: [],
      });

      await handler({
        event,
        advertising: { handleAdvertisingData: "auto" },
      });

      expect(collectSurferIdFn).not.toHaveBeenCalled();
      expect(getID5IdFn).not.toHaveBeenCalled();
      expect(getRampIdFn).not.toHaveBeenCalled();
      expect(event.mergeQuery).not.toHaveBeenCalled();
    });

    it("returns early when all advertiser entries are disabled", async () => {
      const handler = buildHandlerWith({
        id5PartnerId: "test-partner",
        rampIdJSPath: "/test-path",
        advertiserSettings: [
          { advertiserId: "adv-1", enabled: false },
          { advertiserId: "adv-2", enabled: false },
        ],
      });

      await handler({
        event,
        advertising: { handleAdvertisingData: "auto" },
      });

      expect(collectSurferIdFn).not.toHaveBeenCalled();
      expect(getID5IdFn).not.toHaveBeenCalled();
      expect(getRampIdFn).not.toHaveBeenCalled();
      expect(event.mergeQuery).not.toHaveBeenCalled();
    });

    it("proceeds with identity resolution when at least one advertiser is enabled", async () => {
      collectSurferIdFn.mockResolvedValue("test-surfer-id");
      getID5IdFn.mockResolvedValue("test-id5-id");
      getRampIdFn.mockResolvedValue("test-ramp-id");

      const handler = buildHandlerWith({
        id5PartnerId: "test-partner",
        rampIdJSPath: "/test-path",
        advertiserSettings: [
          { advertiserId: "adv-1", enabled: true },
          { advertiserId: "adv-2", enabled: false },
        ],
      });

      await handler({
        event,
        advertising: { handleAdvertisingData: "auto" },
      });

      expect(collectSurferIdFn).toHaveBeenCalled();
      expect(getID5IdFn).toHaveBeenCalled();
      expect(getRampIdFn).toHaveBeenCalled();
      expect(event.mergeQuery).toHaveBeenCalled();
    });
  });

  it("logs when unexpected errors are thrown", async () => {
    collectSurferIdFn.mockResolvedValue("test-surfer-id");
    appendAdvertisingIdQueryToEventFn.mockImplementation(() => {
      throw new Error("boom");
    });

    await onBeforeEvent({
      event,
      advertising: { handleAdvertisingData: "auto" },
    });

    expect(logger.error).toHaveBeenCalledWith(
      "Error in onBeforeSendEvent hook:",
      expect.any(Error),
    );
  });
});

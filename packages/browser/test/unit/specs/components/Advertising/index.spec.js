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

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import createAdvertising from "../../../../../src/components/Advertising/index.js";

describe("Advertising::index", () => {
  let advertising;
  let logger;
  let config;
  let eventManager;
  let sendEdgeNetworkRequest;
  let consent;
  let getBrowser;
  let getUrlParams;
  let platformServices;

  beforeEach(() => {
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
    config = {
      orgId: "org@AdobeOrg",
      advertising: {
        advertiserSettings: [
          { advertiserId: "123", enabled: true },
          { advertiserId: "456", enabled: true },
        ],
        id5PartnerId: "test-partner",
        rampIdJSPath: "/test-path",
      },
    };
    eventManager = {
      createEvent: vi.fn(),
    };
    sendEdgeNetworkRequest = vi.fn();
    consent = {
      awaitConsent: vi.fn().mockResolvedValue(),
      current: vi.fn().mockReturnValue({ state: "in", wasSet: true }),
    };
    getBrowser = vi.fn().mockReturnValue("Firefox");
    getUrlParams = vi.fn().mockReturnValue({ skwcid: null, efid: null });
    platformServices = {
      cookie: {
        get: vi.fn(),
        getAll: vi.fn().mockReturnValue({}),
        set: vi.fn(),
        remove: vi.fn(),
        withConverter: vi.fn().mockReturnThis(),
      },
    };

    advertising = createAdvertising({
      logger,
      config,
      eventManager,
      sendEdgeNetworkRequest,
      consent,
      getBrowser,
      getUrlParams,
      platformServices,
    });
  });

  afterEach(() => {
    advertising = null;
  });

  it("should create the advertising component", () => {
    expect(advertising).toBeDefined();
    expect(advertising).toHaveProperty("lifecycle");
    expect(advertising.lifecycle).toHaveProperty("onComponentsRegistered");
    expect(advertising.lifecycle).toHaveProperty("onBeforeEvent");
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("should create the advertising component when enabled is true", () => {
    config.advertising.enabled = true;
    advertising = createAdvertising({
      logger,
      config,
      eventManager,
      sendEdgeNetworkRequest,
      consent,
      getBrowser,
      platformServices,
    });
    expect(advertising.lifecycle).toHaveProperty("onComponentsRegistered");
    expect(advertising.lifecycle).toHaveProperty("onBeforeEvent");
  });

  describe("when enabled is false", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      config.advertising.enabled = false;
      advertising = createAdvertising({
        logger,
        config,
        eventManager,
        sendEdgeNetworkRequest,
        consent,
        getBrowser,
        platformServices,
      });
    });

    it("registers no lifecycle hooks or commands", () => {
      expect(advertising).toEqual({});
    });

    it("logs that advertising is disabled", () => {
      expect(logger.info).toHaveBeenCalledExactlyOnceWith(
        "Advertising is disabled because advertising.enabled is false",
      );
    });

    it("does not touch cookies or consent", () => {
      expect(platformServices.cookie.get).not.toHaveBeenCalled();
      expect(platformServices.cookie.getAll).not.toHaveBeenCalled();
      expect(platformServices.cookie.set).not.toHaveBeenCalled();
      expect(platformServices.cookie.remove).not.toHaveBeenCalled();
      expect(platformServices.cookie.withConverter).not.toHaveBeenCalled();
      expect(consent.awaitConsent).not.toHaveBeenCalled();
      expect(consent.current).not.toHaveBeenCalled();
      expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
    });
  });
});

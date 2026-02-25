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
    
    advertising = createAdvertising({
      logger,
      config,
      eventManager,
      sendEdgeNetworkRequest,
      consent,
      getBrowser,
      getUrlParams,
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
  });
});

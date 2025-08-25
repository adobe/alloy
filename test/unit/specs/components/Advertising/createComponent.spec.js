/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";

// Mock the onBeforeSendEventHandler
vi.mock(
  "../../../../../packages/core/src/components/Advertising/handlers/onBeforeSendEventHandler.js",
  () => ({
    default: vi.fn(),
  }),
);

// Mock the sendAdConversion handler
vi.mock(
  "../../../../../packages/core/src/components/Advertising/handlers/sendAdConversion.js",
  () => ({
    default: vi.fn(() => vi.fn()),
  }),
);

import createComponent from "../../../../../packages/core/src/components/Advertising/createComponent.js";
import handleOnBeforeSendEvent from "../../../../../packages/core/src/components/Advertising/handlers/onBeforeSendEventHandler.js";

describe("Advertising::createComponent", () => {
  let logger;
  let config;
  let eventManager;
  let cookieManager;
  let adConversionHandler;
  let component;

  beforeEach(() => {
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
    };

    config = {
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

    cookieManager = {
      getValue: vi.fn(),
      setValue: vi.fn(),
    };

    adConversionHandler = {
      trackAdConversion: vi.fn(),
    };

    // Reset mocks
    vi.mocked(handleOnBeforeSendEvent).mockReset();

    component = createComponent({
      logger,
      config,
      eventManager,
      cookieManager,
      adConversionHandler,
    });
  });

  it("should create component with lifecycle hooks", () => {
    expect(component).toHaveProperty("lifecycle");
    expect(component.lifecycle).toHaveProperty("onComponentsRegistered");
    expect(component.lifecycle).toHaveProperty("onBeforeEvent");
    expect(typeof component.lifecycle.onComponentsRegistered).toBe("function");
    expect(typeof component.lifecycle.onBeforeEvent).toBe("function");
  });

  it("should call onBeforeSendEvent handler with correct parameters including options", async () => {
    const event = { mergeQuery: vi.fn() };
    const advertising = { handleAdvertisingData: "wait" };

    await component.lifecycle.onBeforeEvent({ event, advertising });

    expect(handleOnBeforeSendEvent).toHaveBeenCalledWith({
      cookieManager,
      logger,
      event,
      componentConfig: config.advertising,
      advertising,
      getBrowser: undefined,
    });
  });

  it("should handle onBeforeEvent with empty options", async () => {
    const event = { mergeQuery: vi.fn() };

    await component.lifecycle.onBeforeEvent({ event });

    expect(handleOnBeforeSendEvent).toHaveBeenCalledWith({
      cookieManager,
      logger,
      event,
      componentConfig: config.advertising,
      advertising: {},
      getBrowser: undefined,
    });
  });

  it("should handle onBeforeEvent with undefined options", async () => {
    const event = { mergeQuery: vi.fn() };

    await component.lifecycle.onBeforeEvent({ event, advertising: undefined });

    expect(handleOnBeforeSendEvent).toHaveBeenCalledWith({
      cookieManager,
      logger,
      event,
      componentConfig: config.advertising,
      advertising: {},
      getBrowser: undefined,
    });
  });

  it("should maintain shared state across calls", async () => {
    const event = { mergeQuery: vi.fn() };

    await component.lifecycle.onBeforeEvent({ event });
    await component.lifecycle.onBeforeEvent({ event });

    // Both calls should use the same state object
    const firstCallState = vi.mocked(handleOnBeforeSendEvent).mock.calls[0][0]
      .state;
    const secondCallState = vi.mocked(handleOnBeforeSendEvent).mock.calls[1][0]
      .state;

    expect(firstCallState).toBe(secondCallState);
  });
});

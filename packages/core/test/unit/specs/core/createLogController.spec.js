/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import createLogController from "../../../../src/core/createLogController.js";

const instanceName = "alloy123";
describe("createLogController", () => {
  let console;
  let locationSearch;
  let logger;
  let createLogger;
  let getDebugEnabled;
  let sessionStorage;
  let createNamespacedStorage;
  let getMonitors;
  beforeEach(() => {
    console = {
      log() {},
    };
    locationSearch = "";
    logger = {
      log() {},
    };
    createLogger = vi
      .fn()
      .mockImplementation(({ getDebugEnabled: _getDebugEnabled }) => {
        getDebugEnabled = _getDebugEnabled;
        return logger;
      });
    sessionStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    };
    createNamespacedStorage = vi.fn().mockReturnValue({
      session: sessionStorage,
    });
    getMonitors = () => [];
  });
  it("creates a namespaced storage", () => {
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    expect(createNamespacedStorage).toHaveBeenCalledWith("instance.alloy123.");
  });
  it("returns false for getDebugEnabled if storage item is not found", () => {
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    expect(getDebugEnabled()).toBe(false);
  });
  it("returns false for getDebugEnabled if storage item is false", () => {
    sessionStorage.getItem = () => "false";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    expect(getDebugEnabled()).toBe(false);
  });
  it("returns true for getDebugEnabled if storage item is true", () => {
    sessionStorage.getItem = () => "true";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    expect(getDebugEnabled()).toBe(true);
  });
  it("persists changes to debugEnabled if not set from config", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    logController.setDebugEnabled(true, {
      fromConfig: false,
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("debug", "true");
    expect(getDebugEnabled()).toBe(true);
  });
  it("does not persist changes to debugEnabled if set from config", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    logController.setDebugEnabled(true, {
      fromConfig: true,
    });
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
    expect(getDebugEnabled()).toBe(true);
  });
  it("does not change debugEnabled from config if previously changed from something other than config on same page load", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    logController.setDebugEnabled(true, {
      fromConfig: false,
    });
    logController.setDebugEnabled(false, {
      fromConfig: true,
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("debug", "true");
    expect(sessionStorage.setItem).not.toHaveBeenCalledWith("debug", "false");
    expect(getDebugEnabled()).toBe(true);
  });
  it("does not change debugEnabled from config if previously changed from something other than config on previous page load", () => {
    sessionStorage.getItem = () => "true";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    logController.setDebugEnabled(false, {
      fromConfig: true,
    });
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
    expect(getDebugEnabled()).toBe(true);
  });
  it("sets debugEnabled to true if query string parameter set to true", () => {
    locationSearch = "?alloy_debug=true";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });

    // Make sure setting debugEnabled from config can't override it.
    logController.setDebugEnabled(false, {
      fromConfig: true,
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("debug", "true");
    expect(sessionStorage.setItem.mock.calls.length).toBe(1);
    expect(getDebugEnabled()).toBe(true);
  });
  it("sets debugEnabled to false if query string parameter set to false", () => {
    locationSearch = "?alloy_debug=false";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });

    // Make sure setting debugEnabled from config can't override it.
    logController.setDebugEnabled(true, {
      fromConfig: true,
    });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("debug", "false");
    expect(sessionStorage.setItem.mock.calls.length).toBe(1);
    expect(getDebugEnabled()).toBe(false);
  });
  it("creates a logger", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    expect(createLogger).toHaveBeenCalledWith({
      getDebugEnabled,
      console,
      getMonitors,
      context: {
        instanceName: "alloy123",
      },
    });
    expect(logController.logger).toBe(logger);
  });
  it("creates a component logger", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceName,
      createNamespacedStorage,
      getMonitors,
    });
    const componentLogger = {};
    createLogger.mockReturnValue(componentLogger);
    const result = logController.createComponentLogger("Personalization");
    expect(createLogger).toHaveBeenCalledWith({
      getDebugEnabled,
      console,
      getMonitors,
      context: {
        instanceName: "alloy123",
        componentName: "Personalization",
      },
    });
    expect(result).toBe(componentLogger);
  });
});

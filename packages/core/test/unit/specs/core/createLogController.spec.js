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
  let logger;
  let createLogger;
  let getDebugEnabled;
  let getMonitors;
  beforeEach(() => {
    console = {
      log() {},
    };
    logger = {
      log() {},
    };
    createLogger = vi
      .fn()
      .mockImplementation(({ getDebugEnabled: _getDebugEnabled }) => {
        getDebugEnabled = _getDebugEnabled;
        return logger;
      });
    getMonitors = () => [];
  });

  const build = () =>
    createLogController({ console, createLogger, instanceName, getMonitors });

  it("returns false for getDebugEnabled by default", () => {
    build();
    expect(getDebugEnabled()).toBe(false);
  });
  it("returns true for getDebugEnabled after setDebugEnabled(true)", () => {
    const logController = build();
    logController.setDebugEnabled(true);
    expect(getDebugEnabled()).toBe(true);
  });
  it("returns false for getDebugEnabled after setDebugEnabled(false)", () => {
    const logController = build();
    logController.setDebugEnabled(true);
    logController.setDebugEnabled(false);
    expect(getDebugEnabled()).toBe(false);
  });
  it("creates a logger", () => {
    const logController = build();
    expect(createLogger).toHaveBeenCalledWith({
      getDebugEnabled,
      console,
      getMonitors,
      context: { instanceName: "alloy123" },
    });
    expect(logController.logger).toBe(logger);
  });
  it("creates a component logger", () => {
    const logController = build();
    const componentLogger = {};
    createLogger.mockReturnValue(componentLogger);
    const result = logController.createComponentLogger("Personalization");
    expect(createLogger).toHaveBeenCalledWith({
      getDebugEnabled,
      console,
      getMonitors,
      context: { instanceName: "alloy123", componentName: "Personalization" },
    });
    expect(result).toBe(componentLogger);
  });
});

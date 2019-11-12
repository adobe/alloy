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

import createLogController from "../../../../src/core/createLogController";

const instanceNamespace = "alloy123";

describe("createLogController", () => {
  let console;
  let locationSearch;
  let logger;
  let createLogger;
  let getDebugEnabled;
  let sessionStorage;
  let createNamespacedStorage;

  beforeEach(() => {
    console = { log() {} };
    locationSearch = "";
    logger = { log() {} };
    createLogger = jasmine.createSpy().and.callFake((_, _getDebugEnabled) => {
      getDebugEnabled = _getDebugEnabled;
      return logger;
    });
    sessionStorage = {
      getItem: jasmine.createSpy().and.returnValue(null),
      setItem: jasmine.createSpy()
    };
    createNamespacedStorage = jasmine.createSpy().and.returnValue({
      session: sessionStorage
    });
  });

  it("creates a namespaced storage", () => {
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    expect(createNamespacedStorage).toHaveBeenCalledWith("instance.alloy123.");
  });

  it("returns false for getDebugEnabled if storage item is not found", () => {
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    expect(getDebugEnabled()).toBe(false);
  });

  it("returns false for getDebugEnabled if storage item is false", () => {
    sessionStorage.getItem = () => "false";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    expect(getDebugEnabled()).toBe(false);
  });

  it("returns true for getDebugEnabled if storage item is true", () => {
    sessionStorage.getItem = () => "true";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    expect(getDebugEnabled()).toBe(true);
  });

  it("persists changes to debugEnabled if not set from config", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setDebugEnabled(true, { fromConfig: false });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    expect(getDebugEnabled()).toBe(true);
  });

  it("does not persist changes to debugEnabled if set from config", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setDebugEnabled(true, { fromConfig: true });
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
    expect(getDebugEnabled()).toBe(true);
  });

  it("does not change debugEnabled from config if previously changed from something other than config", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setDebugEnabled(true, { fromConfig: false });
    logController.setDebugEnabled(false, { fromConfig: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    expect(sessionStorage.setItem).not.toHaveBeenCalledWith("log", "false");
    expect(getDebugEnabled()).toBe(true);
  });

  it("sets debugEnabled to true if query string parameter set to true", () => {
    locationSearch = "?alloy_log=true";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    // Make sure setting debugEnabled from config can't override it.
    logController.setDebugEnabled(false, { fromConfig: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    expect(sessionStorage.setItem.calls.count()).toBe(1);
    expect(getDebugEnabled()).toBe(true);
  });

  it("sets debugEnabled to false if query string parameter set to false", () => {
    locationSearch = "?alloy_log=false";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    // Make sure setting debugEnabled from config can't override it.
    logController.setDebugEnabled(true, { fromConfig: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "false");
    expect(sessionStorage.setItem.calls.count()).toBe(1);
    expect(getDebugEnabled()).toBe(false);
  });

  it("creates a logger", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    expect(createLogger).toHaveBeenCalledWith(
      console,
      jasmine.any(Function),
      "[alloy123]"
    );
    expect(logController.logger).toBe(logger);
  });

  it("creates a component logger", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const componentLogger = {};
    createLogger.and.returnValue(componentLogger);
    const result = logController.createComponentLogger("Personalization");

    expect(createLogger).toHaveBeenCalledWith(
      console,
      getDebugEnabled,
      "[alloy123] [Personalization]"
    );
    expect(result).toBe(componentLogger);
  });
});

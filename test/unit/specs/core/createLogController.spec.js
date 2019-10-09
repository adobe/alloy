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
  let sessionStorage;
  let createNamespacedStorage;

  beforeEach(() => {
    console = { log() {} };
    locationSearch = "";
    logger = { log() {} };
    createLogger = jasmine.createSpy().and.returnValue(logger);
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

  it("returns false for getLogEnabled if storage item is not found", () => {
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(false);
  });

  it("returns false for getLogEnabled if storage item is false", () => {
    sessionStorage.getItem = () => "false";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(false);
  });

  it("returns true for getLogEnabled if storage item is true", () => {
    sessionStorage.getItem = () => "true";
    createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(true);
  });

  it("persists changes to logEnabled if persist is true", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setLogEnabled(true, { persist: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(true);
  });

  it("does not persist changes to logEnabled if persist is false", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setLogEnabled(true, { persist: false });
    expect(sessionStorage.setItem).not.toHaveBeenCalled();
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(true);
  });

  it("does not change logEnabled with low priority if it was changed previously with high priority", () => {
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setLogEnabled(true, { highPriority: true, persist: true });
    logController.setLogEnabled(false, { highPriority: false, persist: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    expect(sessionStorage.setItem).not.toHaveBeenCalledWith("log", "false");
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(true);
  });

  it("sets logEnabled to true with high priority if query string parameter set to true", () => {
    locationSearch = "?alloy_log=true";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setLogEnabled(false, { highPriority: false, persist: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "true");
    expect(sessionStorage.setItem).not.toHaveBeenCalledWith("log", "false");
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(true);
  });

  it("sets logEnabled to false with high priority if query string parameter set to false", () => {
    locationSearch = "?alloy_log=false";
    const logController = createLogController({
      console,
      locationSearch,
      createLogger,
      instanceNamespace,
      createNamespacedStorage
    });

    logController.setLogEnabled(true, { highPriority: false, persist: true });
    expect(sessionStorage.setItem).toHaveBeenCalledWith("log", "false");
    expect(sessionStorage.setItem).not.toHaveBeenCalledWith("log", "true");
    const getLogEnabled = createLogger.calls.argsFor(0)[1];
    expect(getLogEnabled()).toBe(false);
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
      jasmine.any(Function),
      "[alloy123] [Personalization]"
    );
    const getLogEnabled = createLogger.calls.mostRecent().args[1];
    expect(getLogEnabled()).toBe(false);
    expect(result).toBe(componentLogger);
  });
});

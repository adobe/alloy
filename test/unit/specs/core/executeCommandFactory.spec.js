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

import executeCommandFactory from "../../../../src/core/executeCommandFactory";
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("executeCommandFactory", () => {
  let logger;
  let handleError;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log", "info", "warn", "error"]);
    handleError = jasmine.createSpy().and.callFake(error => {
      throw error;
    });
  });

  it("rejects promise if configure is not the first command executed", () => {
    const executeCommand = executeCommandFactory({
      logger,
      handleError
    });

    return executeCommand("event")
      .then(fail)
      .catch(error => {
        expect(error.message).toContain("The library must be configured first");
      });
  });

  it("rejects promise if configure command is executed twice", () => {
    const configureCommand = () => Promise.resolve();
    const executeCommand = executeCommandFactory({
      logger,
      configureCommand,
      handleError
    });

    executeCommand("configure");
    return executeCommand("configure")
      .then(fail)
      .catch(error => {
        expect(error.message).toContain(
          "The library has already been configured"
        );
      });
  });

  it("rejects promise if command doesn't exist", () => {
    const componentRegistry = {
      getCommand() {}
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    const executeCommand = executeCommandFactory({
      logger,
      configureCommand,
      handleError
    });
    executeCommand("configure");
    return executeCommand("bogus")
      .then(fail)
      .catch(error => {
        expect(error.message).toBe("The bogus command does not exist.");
      });
  });

  it("never resolves/rejects promise to any other command after configure fails", () => {
    const configureCommand = () => Promise.reject();
    const executeCommand = executeCommandFactory({
      logger,
      configureCommand,
      handleError
    });

    executeCommand("configure");
    const thenSpy = jasmine.createSpy();
    const catchSpy = jasmine.createSpy();
    executeCommand("event")
      .then(thenSpy)
      .catch(catchSpy);
    return flushPromiseChains().then(() => {
      expect(logger.warn).toHaveBeenCalledWith(
        "An error during configuration is preventing the event command from executing."
      );
      expect(thenSpy).not.toHaveBeenCalled();
      expect(catchSpy).not.toHaveBeenCalled();
    });
  });

  it("executes the core commands", () => {
    const configureCommand = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve("configureResult"));
    const debugCommand = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve("logResult"));
    const executeCommand = executeCommandFactory({
      logger,
      configureCommand,
      debugCommand,
      handleError
    });

    return Promise.all([
      executeCommand("configure", { foo: "bar" }),
      executeCommand("log", { baz: "qux" })
    ]).then(([configureResult, logResult]) => {
      expect(configureCommand).toHaveBeenCalledWith({ foo: "bar" });
      expect(debugCommand).toHaveBeenCalledWith({ baz: "qux" });
      expect(configureResult).toEqual("configureResult");
      expect(logResult).toEqual("logResult");
    });
  });
});

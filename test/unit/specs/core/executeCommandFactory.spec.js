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

const namespace = "foo";

describe("executeCommandFactory", () => {
  let logger;
  let getErrorsEnabled;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log", "info", "warn", "error"]);
    getErrorsEnabled = jasmine.createSpy().and.returnValue(true);
  });

  it("rejects promise if configure is not the first command executed", () => {
    const executeCommand = executeCommandFactory({
      namespace,
      logger,
      getErrorsEnabled
    });

    return executeCommand("event")
      .then(fail)
      .catch(error => {
        expect(error.message).toContain(
          "[foo] The library must be configured first"
        );
      });
  });

  it("rejects promise if configure command is executed twice", () => {
    const configureCommand = () => Promise.resolve();
    const executeCommand = executeCommandFactory({
      namespace,
      logger,
      getErrorsEnabled,
      configureCommand
    });

    executeCommand("configure");
    return executeCommand("configure")
      .then(fail)
      .catch(error => {
        expect(error.message).toContain(
          "[foo] The library has already been configured"
        );
      });
  });

  it("rejects promise if command doesn't exist", () => {
    const componentRegistry = {
      getCommand() {}
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    const executeCommand = executeCommandFactory({
      namespace,
      logger,
      getErrorsEnabled,
      configureCommand
    });
    executeCommand("configure");
    executeCommand("bogus")
      .then(fail)
      .catch(error => {
        expect(error.message).toBe("[foo] The bogus command does not exist.");
      });
  });

  it("never resolves/rejects promise to any other command after configure fails", () => {
    const configureCommand = () => Promise.reject();
    const executeCommand = executeCommandFactory({
      namespace,
      logger,
      getErrorsEnabled,
      configureCommand
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
    const logCommand = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve("logResult"));
    const executeCommand = executeCommandFactory({
      namespace,
      logger,
      getErrorsEnabled,
      configureCommand,
      logCommand
    });

    return Promise.all([
      executeCommand("configure", { foo: "bar" }),
      executeCommand("log", { baz: "qux" })
    ]).then(([configureResult, logResult]) => {
      expect(configureCommand).toHaveBeenCalledWith({ foo: "bar" });
      expect(logCommand).toHaveBeenCalledWith({ baz: "qux" });
      expect(configureResult).toEqual("configureResult");
      expect(logResult).toEqual("logResult");
    });
  });
});

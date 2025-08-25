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
import injectExecuteCommand from "../../../../src/core/injectExecuteCommand.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";

describe("injectExecuteCommand", () => {
  let logger;
  let handleError;
  beforeEach(() => {
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      logOnBeforeCommand: vi.fn(),
      logOnCommandResolved: vi.fn(),
      logOnCommandRejected: vi.fn(),
    };
    handleError = vi.fn().mockImplementation((error) => {
      throw error;
    });
  });
  it("rejects promise if configure is not the first command executed", () => {
    const executeCommand = injectExecuteCommand({
      logger,
      handleError,
    });
    return executeCommand("sendEvent").catch((error) => {
      expect(error.message).toContain("The library must be configured first");
      expect(handleError).toHaveBeenCalledWith(error, "sendEvent command");
    });
  });
  it("rejects promise if configure command is executed twice", () => {
    const configureCommand = () => Promise.resolve();
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
    });
    executeCommand("configure");
    return executeCommand("configure").catch((error) => {
      expect(error.message).toContain(
        "The library has already been configured",
      );
      expect(handleError).toHaveBeenCalledWith(error, "configure command");
    });
  });
  it("rejects promise if command doesn't exist", () => {
    const componentRegistry = {
      getCommand() {},
      getCommandNames() {
        return ["genuine"];
      },
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
    });
    executeCommand("configure");
    return executeCommand("bogus").catch((error) => {
      expect(error.message).toBe(
        "The bogus command does not exist. List of available commands: configure, setDebug, genuine.",
      );
      expect(handleError).toHaveBeenCalledWith(error, "bogus command");
    });
  });
  it("never resolves/rejects promise to any other command after configure fails", () => {
    const configureError = new Error("Test configure command failed");
    const configureCommand = () => Promise.reject(configureError);
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
    });
    const configureRejectedSpy = vi.fn();
    executeCommand("configure").catch(configureRejectedSpy);
    const sendEventResolvedSpy = vi.fn();
    const sendEventRejectedSpy = vi.fn();
    executeCommand("sendEvent")
      .then(sendEventResolvedSpy)
      .catch(sendEventRejectedSpy);
    return flushPromiseChains().then(() => {
      expect(configureRejectedSpy).toHaveBeenCalledWith(configureError);
      expect(logger.warn).toHaveBeenCalledWith(
        "An error during configuration is preventing the sendEvent command from executing.",
      );
      expect(sendEventResolvedSpy).not.toHaveBeenCalled();
      expect(sendEventRejectedSpy).not.toHaveBeenCalled();
    });
  });
  it("reject promise if component command throws error", () => {
    const runCommandSpy = vi.fn().mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    const testCommand = {
      run: runCommandSpy,
    };
    const componentRegistry = {
      getCommand: () => testCommand,
      getCommandNames() {
        return ["test"];
      },
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
      validateCommandOptions: (options) => options,
    });
    executeCommand("configure");
    return executeCommand("test", {}).catch(() => {
      expect(handleError).toHaveBeenCalledWith(
        new Error("Unexpected error"),
        "test command",
      );
    });
  });
  it("executes component commands", () => {
    const validateCommandOptionsSpy = vi
      .fn()
      .mockReturnValueOnce("with-result-post-validation-options")
      .mockReturnValueOnce("without-result-post-validation-options");
    const testCommandWithResult = {
      run: vi.fn().mockReturnValue({
        foo: "bar",
      }),
    };
    const testCommandWithoutResult = {
      run: vi.fn().mockReturnValue(undefined),
    };
    const componentRegistry = {
      getCommand: vi
        .fn()
        .mockReturnValueOnce(testCommandWithResult)
        .mockReturnValueOnce(testCommandWithoutResult),
      getCommandNames() {
        return ["testCommandWithResult", "testCommandWithoutResult"];
      },
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
      validateCommandOptions: validateCommandOptionsSpy,
    });
    executeCommand("configure");
    return Promise.all([
      executeCommand(
        "testCommandWithResult",
        "with-result-pre-validation-options",
      ),
      executeCommand(
        "testCommandWithoutResult",
        "without-result-pre-validation-options",
      ),
    ]).then((results) => {
      expect(results[0]).toEqual({
        foo: "bar",
      });
      expect(results[1]).toEqual({});
      expect(validateCommandOptionsSpy).toHaveBeenCalledWith({
        command: testCommandWithResult,
        options: "with-result-pre-validation-options",
      });
      expect(validateCommandOptionsSpy).toHaveBeenCalledWith({
        command: testCommandWithoutResult,
        options: "without-result-pre-validation-options",
      });
      expect(testCommandWithResult.run).toHaveBeenCalledWith(
        "with-result-post-validation-options",
      );
      expect(testCommandWithoutResult.run).toHaveBeenCalledWith(
        "without-result-post-validation-options",
      );
    });
  });
  it("executes the core commands", () => {
    const componentRegistry = {
      getCommand() {},
    };
    const configureCommand = vi
      .fn()
      .mockReturnValue(Promise.resolve(componentRegistry));
    const setDebugCommand = vi.fn();
    const validateCommandOptions = vi.fn().mockReturnValue({
      enabled: true,
    });
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      setDebugCommand,
      handleError,
      validateCommandOptions,
    });
    return Promise.all([
      executeCommand("configure", {
        foo: "bar",
      }),
      executeCommand("setDebug", {
        baz: "qux",
      }),
    ]).then(([configureResult, setDebugResult]) => {
      expect(configureCommand).toHaveBeenCalledWith({
        foo: "bar",
      });
      expect(setDebugCommand).toHaveBeenCalledWith({
        enabled: true,
      });
      expect(configureResult).toEqual({});
      expect(setDebugResult).toEqual({});
    });
  });
  const buildWithTestCommand = (runCommand) => {
    const testCommand = {
      run: runCommand,
    };
    const componentRegistry = {
      getCommand: () => testCommand,
      getCommandNames() {
        return ["test"];
      },
    };
    const configureCommand = () => Promise.resolve(componentRegistry);
    return injectExecuteCommand({
      logger,
      configureCommand,
      handleError,
      validateCommandOptions: (options) => options,
    });
  };
  it("logs onBeforeCommand", () => {
    const executeCommand = buildWithTestCommand(() => {
      expect(logger.logOnBeforeCommand).toHaveBeenCalledWith({
        commandName: "test",
        options: {
          my: "options",
        },
      });
    });
    executeCommand("configure");
    return executeCommand("test", {
      my: "options",
    });
  });
  it("logs onCommandResolved", () => {
    const executeCommand = buildWithTestCommand(() => {
      expect(logger.logOnCommandResolved).not.toHaveBeenCalled();
      return {
        go: "bananas",
      };
    });
    executeCommand("configure");
    return executeCommand("test", {
      my: "options",
    }).then((result) => {
      expect(result).toEqual({
        go: "bananas",
      });
      expect(logger.logOnCommandResolved).toHaveBeenCalledWith({
        commandName: "test",
        options: {
          my: "options",
        },
        result: {
          go: "bananas",
        },
      });
    });
  });
  it("logs onCommandRejected", () => {
    const myerror = Error("bananas");
    const executeCommand = buildWithTestCommand(() => {
      expect(logger.logOnCommandRejected).not.toHaveBeenCalled();
      throw myerror;
    });
    executeCommand("configure");
    return executeCommand("test", {
      my: "options",
    }).catch((error) => {
      expect(error).toEqual(myerror);
      expect(logger.logOnCommandRejected).toHaveBeenCalledWith({
        commandName: "test",
        options: {
          my: "options",
        },
        error: myerror,
      });
    });
  });
  it("logs onCommandResolved when handleError swallows the error", () => {
    const myerror = Error("bananas");
    handleError.mockReturnValue({});
    const executeCommand = buildWithTestCommand(() => {
      throw myerror;
    });
    executeCommand("configure");
    return executeCommand("test", {
      my: "options",
    }).then((result) => {
      expect(result).toEqual({});
      expect(logger.logOnCommandResolved).toHaveBeenCalledWith({
        commandName: "test",
        options: {
          my: "options",
        },
        result: {},
      });
      expect(logger.logOnCommandRejected).not.toHaveBeenCalled();
    });
  });
});

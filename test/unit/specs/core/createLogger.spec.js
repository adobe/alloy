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
import createLogger from "../../../../src/core/createLogger.js";

const logMethods = ["info", "warn", "error"];
const monitorMethods = [
  "onInstanceCreated",
  "onInstanceConfigured",
  "onBeforeCommand",
  "onCommandResolved",
  "onCommandRejected",
  "onBeforeNetworkRequest",
  "onNetworkResponse",
  "onNetworkError",
];
const message = "test message";
describe("createLogger", () => {
  let logEnabled;
  let logger;
  let console;
  let getDebugEnabled;
  let context;
  let getMonitors;
  beforeEach(() => {
    console = logMethods.reduce((acc, logMethod) => {
      acc[logMethod] = vi.fn();
      return acc;
    }, {});
    getDebugEnabled = () => logEnabled;
    context = {
      instanceName: "myinstance",
    };
    getMonitors = () => [];
  });
  const build = () => {
    logger = createLogger({
      console,
      getDebugEnabled,
      context,
      getMonitors,
    });
  };
  logMethods.forEach((logMethod) => {
    it(`logs message if debugging is enabled and ${logMethod} is called`, () => {
      logEnabled = true;
      build();
      logger[logMethod](message);
      expect(console[logMethod]).toHaveBeenCalledWith("[myinstance]", message);
    });
    it(`does not log a message if debugging is disabled and ${logMethod} is called`, () => {
      logEnabled = false;
      build();
      logger[logMethod](message);
      expect(console[logMethod]).not.toHaveBeenCalled();
    });
  });
  it("is enabled if logEnabled", () => {
    logEnabled = true;
    getMonitors = () => [];
    build();
    expect(logger.enabled).toBe(true);
  });
  it("is enabled if there are monitors", () => {
    logEnabled = false;
    getMonitors = () => [{}];
    build();
    expect(logger.enabled).toBe(true);
  });
  it("is not enabled if no logEnabled and no monitors", () => {
    logEnabled = false;
    getMonitors = () => [];
    build();
    expect(logger.enabled).toBe(false);
  });
  it("is ok for a monitor to only implement some of the methods", () => {
    getMonitors = () => [{}];
    build();
    logger.logOnInstanceCreated({
      b: "2",
    });
  });
  monitorMethods.forEach((monitorMethod) => {
    it(`calls the monitor method ${monitorMethod}`, () => {
      const loggerMethod = `log${monitorMethod.charAt(0).toUpperCase()}${monitorMethod.slice(1)}`;
      context = {
        a: "1",
      };
      const monitor1 = {
        [monitorMethod]: vi.fn(),
        onBeforeLog: vi.fn(),
      };

      const monitor2 = {
        [monitorMethod]: vi.fn(),
      };
      getMonitors = () => [monitor1, monitor2];
      build();
      logger[loggerMethod]({
        b: "2",
      });
      expect(monitor1[monitorMethod]).toHaveBeenCalledWith({
        a: "1",
        b: "2",
      });
      expect(monitor1.onBeforeLog).toHaveBeenCalled();
      expect(monitor2[monitorMethod]).toHaveBeenCalledWith({
        a: "1",
        b: "2",
      });
    });
  });
  it("logs onInstanceCreated", () => {
    logEnabled = true;
    build();
    logger.logOnInstanceCreated({});
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Instance initialized.",
    );
  });
  it("logs onInstanceConfigured", () => {
    logEnabled = true;
    build();
    logger.logOnInstanceConfigured({
      config: {
        a: "1",
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Instance configured. Computed configuration:",
      {
        a: "1",
      },
    );
  });
  it("logs onBeforeCommand", () => {
    logEnabled = true;
    build();
    logger.logOnBeforeCommand({
      commandName: "mycommand",
      options: {
        a: "1",
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Executing mycommand command. Options:",
      {
        a: "1",
      },
    );
  });
  it("logs onCommandResolved", () => {
    logEnabled = true;
    build();
    logger.logOnCommandResolved({
      commandName: "mycommand",
      options: {
        a: "1",
      },
      result: {
        b: "2",
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "mycommand command resolved. Result:",
      {
        b: "2",
      },
    );
  });
  it("logs onCommandRejected", () => {
    logEnabled = true;
    build();
    const error = Error("myerror");
    logger.logOnCommandRejected({
      commandName: "mycommand",
      options: {
        a: "1",
      },
      error,
    });
    expect(console.error).toHaveBeenCalledWith(
      "[myinstance]",
      "mycommand command was rejected. Error:",
      error,
    );
  });
  it("logs onBeforeNetworkRequest", () => {
    logEnabled = true;
    build();
    logger.logOnBeforeNetworkRequest({
      requestId: "abc123",
      payload: {
        a: "1",
      },
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Request abc123: Sending request.",
      {
        a: "1",
      },
    );
  });
  it("logs onNetworkResponse with parsedBody", () => {
    logEnabled = true;
    build();
    logger.logOnNetworkResponse({
      parsedBody: {
        a: "1",
      },
      body: "thebody",
      requestId: "abc123",
      statusCode: 200,
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Request abc123: Received response with status code 200 and response body:",
      {
        a: "1",
      },
    );
  });
  it("logs onNetworkResponse with no parsedBody", () => {
    logEnabled = true;
    build();
    logger.logOnNetworkResponse({
      body: "thebody",
      requestId: "abc123",
      statusCode: 200,
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Request abc123: Received response with status code 200 and response body:",
      "thebody",
    );
  });
  it("logs onNetworkResponse with no response body", () => {
    logEnabled = true;
    build();
    logger.logOnNetworkResponse({
      body: "",
      requestId: "abc123",
      statusCode: 200,
    });
    expect(console.info).toHaveBeenCalledWith(
      "[myinstance]",
      "Request abc123: Received response with status code 200 and no response body.",
      "",
    );
  });
  it("logs onNetworkError", () => {
    logEnabled = true;
    build();
    logger.logOnNetworkError({
      requestId: "abc123",
      error: "myerror",
    });
    expect(console.error).toHaveBeenCalledWith(
      "[myinstance]",
      "Request abc123: Network request failed.",
      "myerror",
    );
  });
});

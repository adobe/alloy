/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, describe, beforeEach, it, expect } from "vitest";
import chalk from "chalk";
import createLogger from "../helpers/createLogger.js";

describe("createLogger", () => {
  let myConsole;
  let logger;
  const now = new Date(2001, 2, 3, 4, 5, 6, 7);
  const prefix = chalk.white("[04:05:06.007]");
  beforeEach(() => {
    myConsole = { log: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() };
    logger = createLogger(myConsole, () => now);
  });

  it("adds a prefix", () => {
    logger.log("mylog");

    expect(myConsole.log).toHaveBeenCalledTimes(1);
    expect(myConsole.log).toHaveBeenCalledWith(`${prefix} mylog`);
  });

  it("leaves objects alone", () => {
    const err = new Error("myerror");
    logger.error(err);

    expect(myConsole.error).toHaveBeenCalledTimes(1);
    expect(myConsole.error).toHaveBeenCalledWith(err);
  });

  it("logs warnings yellow", () => {
    logger.warn("mywarn");
    expect(myConsole.warn).toHaveBeenCalledTimes(1);
    expect(myConsole.warn).toHaveBeenCalledWith(
      `${prefix} ${chalk.yellow("mywarn")}`,
    );
  });
  it("logs errors red", () => {
    logger.error("myerror");
    expect(myConsole.error).toHaveBeenCalledWith(
      `${prefix} ${chalk.red("myerror")}`,
    );
  });
  it("logs additional parameters", () => {
    logger.info("a", "b");

    expect(myConsole.info).toHaveBeenCalledTimes(1);
    expect(myConsole.info).toHaveBeenCalledWith(`${prefix} a`, "b");
  });
});

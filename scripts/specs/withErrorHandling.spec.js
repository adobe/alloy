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
import ApplicationError from "../helpers/applicationError.js";
import withErrorHandling from "../helpers/withErrorHandling.js";

describe("withErrorHandling", () => {
  let logger;
  let process;
  let container;
  let func;

  beforeEach(() => {
    logger = { info: vi.fn(), error: vi.fn() };
    process = { exit: vi.fn() };
    container = { logger, process };
    func = vi.fn();
  });

  it("runs without failure", async () => {
    func.mockReturnValue(Promise.resolve());
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(func).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Deploy COMPLETE.");
  });

  it("handles ApplicationErrors", async () => {
    func.mockImplementationOnce(() => {
      throw new ApplicationError("myerrormessage");
    });
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(logger.error).toHaveBeenCalledWith("Deploy FAILED.");
    expect(logger.error).toHaveBeenCalledWith("myerrormessage");
    expect(process.exit).toHaveBeenCalledWith(1);
  });
  it("handles unexpected errors", async () => {
    const error = new Error("myerrormessage");
    func.mockImplementationOnce(() => {
      throw error;
    });
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(logger.error).toHaveBeenCalledWith("Deploy FAILED.");
    expect(logger.error).toHaveBeenCalledWith(
      "An unexpected error was thrown.",
      error,
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

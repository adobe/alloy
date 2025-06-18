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
import publishToNpm from "../helpers/publishToNpm.js";

describe("publishToNpm", () => {
  let exec;
  let execSync;
  let logger;
  const npmTag = "mytag";
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = vi.fn();
    execSync = vi.fn();
    logger = { warn: vi.fn(), info: vi.fn() };
    container = { exec, execSync, logger, npmTag, version };
  });

  it("publishes to NPM", async () => {
    execSync.mockReturnValue("");
    await publishToNpm(container);

    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenCalledWith(
      "npm view @adobe/alloy@1.2.3 version --json",
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Publishing NPM package.");
    expect(exec).toHaveBeenCalledWith("npm publish", expect.any(String));
  });

  it("doesn't publish to NPM", async () => {
    execSync.mockReturnValue('"1.2.3"');
    await publishToNpm(container);

    expect(execSync).toHaveBeenCalledTimes(1);
    expect(execSync).toHaveBeenCalledWith(
      "npm view @adobe/alloy@1.2.3 version --json",
    );

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith("NPM already has version 1.2.3.");
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

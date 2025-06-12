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
import updatePackageVersion from "../helpers/updatePackageVersion.js";

describe("updatePackageVersion", () => {
  let exec;
  const githubRef = "mygithubref";
  let logger;
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = vi.fn().mockReturnValue(Promise.resolve());
    logger = { warn: vi.fn(), info: vi.fn() };
    container = { exec, githubRef, logger, version };
  });

  it("updates the package version", async () => {
    await updatePackageVersion({ currentVersion: "1.2.2", ...container });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      "Updating package.json with version 1.2.3.",
    );
    expect(exec).toHaveBeenCalledTimes(5);
  });

  it("doesn't update the package version", async () => {
    await updatePackageVersion({ currentVersion: "1.2.3", ...container });

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      "Version in package.json is already 1.2.3.",
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

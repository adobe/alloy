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
import updatePackageVersion from "../helpers/updatePackageVersion.js";

describe("updatePackageVersion", () => {
  let exec;
  const githubRef = "mygithubref";
  let logger;
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    exec.and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["warn", "info"]);
    container = { exec, githubRef, logger, version };
  });

  it("updates the package version", async () => {
    await updatePackageVersion({ currentVersion: "1.2.2", ...container });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledOnceWith(
      "Updating package.json with version 1.2.3.",
    );
    expect(exec).toHaveBeenCalledTimes(4);
  });

  it("doesn't update the package version", async () => {
    await updatePackageVersion({ currentVersion: "1.2.3", ...container });
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "Version in package.json is already 1.2.3.",
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

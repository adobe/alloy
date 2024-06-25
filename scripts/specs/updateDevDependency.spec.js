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
import updateDevDependency from "../helpers/updateDevDependency.js";

describe("updateDevDependency", () => {
  let exec;
  let execSync;
  const githubRef = "mygithubref";
  let logger;
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    execSync = jasmine.createSpy("execSync");
    logger = jasmine.createSpyObj("logger", ["warn", "info"]);
    container = { exec, execSync, githubRef, logger, version };
  });

  it("installs the dev dependency", async () => {
    execSync.and.returnValue(
      JSON.stringify({
        dependencies: { "@adobe/alloy": { version: "1.2.2" } },
      }),
    );
    exec.and.returnValue(Promise.resolve());
    await updateDevDependency(container);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledOnceWith(
      "Installing @adobe/alloy@1.2.3 as a dev dependency.",
    );
    expect(exec).toHaveBeenCalledTimes(4);
  });

  it("doesn't install the dev dependency", async () => {
    execSync.and.returnValue(
      JSON.stringify({
        dependencies: { "@adobe/alloy": { version: "1.2.3" } },
      }),
    );
    await updateDevDependency(container);
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "Dependency @adobe/alloy@1.2.3 already installed.",
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

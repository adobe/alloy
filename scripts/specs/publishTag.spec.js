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
import publishTag from "../helpers/publishTag.js";

describe("publishTag", () => {
  let exec;
  let execSync;
  let logger;
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    execSync = jasmine.createSpy("execSync");
    logger = jasmine.createSpyObj("logger", ["warn", "info"]);
    container = { exec, execSync, logger, version: "1.2.3" };
  });

  it("doesn't publish a tag", async () => {
    execSync.and.returnValue("v1.2.3");
    await publishTag(container);
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "Git tag v1.2.3 already published.",
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
  it("publishes a tag", async () => {
    execSync.and.returnValue("");
    exec.and.returnValue(Promise.resolve(), Promise.resolve());
    await publishTag(container);
    expect(logger.info).toHaveBeenCalledOnceWith("Publishing Git tag v1.2.3.");
    expect(logger.warn).not.toHaveBeenCalled();
    expect(exec).toHaveBeenCalledWith("git tag", jasmine.any(String));
    expect(exec).toHaveBeenCalledWith("git push", jasmine.any(String));
  });
});

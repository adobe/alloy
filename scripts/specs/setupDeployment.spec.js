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
import setupDeployment from "../helpers/setupDeployment.js";

describe("setupDeployment", () => {
  let exec;
  const githubActor = "myactor";
  const githubRepository = "myrepo";
  let logger;
  const npmToken = "mytoken";
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    logger = jasmine.createSpyObj("logger", ["info"]);
    container = {
      exec,
      githubActor,
      githubRepository,
      logger,
      npmToken,
      container,
    };
  });

  it("runs setup", async () => {
    await setupDeployment(container);
    expect(logger.info).toHaveBeenCalled();
    // make sure all the container parameters are defined
    expect(exec).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.stringMatching(/myactor/),
    );
    expect(exec).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.stringMatching(/myrepo/),
    );
    expect(exec).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.stringMatching(/mytoken/),
    );
  });
});

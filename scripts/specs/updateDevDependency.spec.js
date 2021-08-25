const updateDevDependency = require("../helpers/updateDevDependency");

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
        dependencies: { "@adobe/alloy": { version: "1.2.2" } }
      })
    );
    exec.and.returnValue(Promise.resolve());
    await updateDevDependency(container);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledOnceWith(
      "Installing @adobe/alloy@1.2.3 as a dev dependency."
    );
    expect(exec).toHaveBeenCalledTimes(4);
  });

  it("doesn't install the dev dependency", async () => {
    execSync.and.returnValue(
      JSON.stringify({
        dependencies: { "@adobe/alloy": { version: "1.2.3" } }
      })
    );
    await updateDevDependency(container);
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "Dependency @adobe/alloy@1.2.3 already installed."
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

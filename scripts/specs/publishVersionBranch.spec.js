const publishVersionBranch = require("../helpers/publishVersionBranch");

describe("publishVersionBranch", () => {
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

  it("doesn't publish a prerelease branch", async () => {
    container.version = "1.2.3-beta.0";
    await publishVersionBranch(container);
    expect(logger.info).toHaveBeenCalledOnceWith(
      "No need to create a test branch for a prerelease version."
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });

  it("doesn't publish a branch that was already published", async () => {
    execSync.and.returnValue("v1.2.3");
    await publishVersionBranch(container);
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "Git branch v1.2.3 already published."
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });

  it("publishes a branch", async () => {
    execSync.and.returnValue("");
    exec.and.returnValue(Promise.resolve(), Promise.resolve());
    await publishVersionBranch(container);
    expect(logger.info).toHaveBeenCalledOnceWith("Publishing Git branch v1.2.3.");
    expect(logger.warn).not.toHaveBeenCalled();
    expect(exec).toHaveBeenCalledWith("git branch", jasmine.any(String));
    expect(exec).toHaveBeenCalledWith("git push", jasmine.any(String));
  });
});

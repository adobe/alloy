const { v1 } = require("uuid");
const publishTag = require("../helpers/publishTag");

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
    expect(logger.warn).toHaveBeenCalledOnceWith("Git tag v1.2.3 already published.");
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

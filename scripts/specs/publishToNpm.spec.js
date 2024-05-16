import publishToNpm from "../helpers/publishToNpm.js";

describe("publishToNpm", () => {
  let exec;
  let execSync;
  let logger;
  const npmTag = "mytag";
  const version = "1.2.3";
  let container;

  beforeEach(() => {
    exec = jasmine.createSpy("exec");
    execSync = jasmine.createSpy("execSync");
    logger = jasmine.createSpyObj("logger", ["warn", "info"]);
    container = { exec, execSync, logger, npmTag, version };
  });

  it("publishes to NPM", async () => {
    execSync.and.returnValue("");
    await publishToNpm(container);
    expect(execSync).toHaveBeenCalledOnceWith(
      "npm view @adobe/alloy@1.2.3 version --json",
    );
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Publishing NPM package.");
    expect(exec).toHaveBeenCalledOnceWith("npm publish", jasmine.any(String));
  });

  it("doesn't publish to NPM", async () => {
    execSync.and.returnValue('"1.2.3"');
    await publishToNpm(container);
    expect(execSync).toHaveBeenCalledOnceWith(
      "npm view @adobe/alloy@1.2.3 version --json",
    );
    expect(logger.warn).toHaveBeenCalledOnceWith(
      "NPM already has version 1.2.3.",
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(exec).not.toHaveBeenCalled();
  });
});

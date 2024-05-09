const updatePackageVersion = require("../helpers/updatePackageVersion");

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

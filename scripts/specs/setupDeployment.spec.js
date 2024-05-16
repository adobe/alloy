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

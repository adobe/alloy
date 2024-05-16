import ApplicationError from "../helpers/applicationError.js";
import withErrorHandling from "../helpers/withErrorHandling.js";

describe("withErrorHandling", () => {
  let logger;
  let process;
  let container;
  let func;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["info", "error"]);
    process = jasmine.createSpyObj("process", ["exit"]);
    container = { logger, process };
    func = jasmine.createSpy("func");
  });

  it("runs without failure", async () => {
    func.and.returnValue(Promise.resolve());
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(func).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Deploy COMPLETE.");
  });

  it("handles ApplicationErrors", async () => {
    func.and.throwError(new ApplicationError("myerrormessage"));
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(logger.error).toHaveBeenCalledWith("Deploy FAILED.");
    expect(logger.error).toHaveBeenCalledWith("myerrormessage");
    expect(process.exit).toHaveBeenCalledWith(1);
  });
  it("handles unexpected errors", async () => {
    const error = new Error("myerrormessage");
    func.and.throwError(error);
    await withErrorHandling(container, "Deploy", func);
    expect(logger.info).toHaveBeenCalledWith("Deploy.");
    expect(logger.error).toHaveBeenCalledWith("Deploy FAILED.");
    expect(logger.error).toHaveBeenCalledWith(
      "An unexpected error was thrown.",
      error,
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

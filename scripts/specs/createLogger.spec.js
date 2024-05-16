import chalk from "chalk";
import createLogger from "../helpers/createLogger.js";

describe("createLogger", () => {
  let myConsole;
  let logger;
  const now = new Date(2001, 2, 3, 4, 5, 6, 7);
  const prefix = chalk.white("[04:05:06.007]");
  beforeEach(() => {
    myConsole = jasmine.createSpyObj("myConsole", [
      "log",
      "info",
      "warn",
      "error",
    ]);
    logger = createLogger(myConsole, () => now);
  });

  it("adds a prefix", () => {
    logger.log("mylog");
    expect(myConsole.log).toHaveBeenCalledOnceWith(`${prefix} mylog`);
  });

  it("leaves objects alone", () => {
    const err = new Error("myerror");
    logger.error(err);
    expect(myConsole.error).toHaveBeenCalledOnceWith(err);
  });

  it("logs warnings yellow", () => {
    logger.warn("mywarn");
    expect(myConsole.warn).toHaveBeenCalledOnceWith(
      `${prefix} ${chalk.yellow("mywarn")}`,
    );
  });
  it("logs errors red", () => {
    logger.error("myerror");
    expect(myConsole.error).toHaveBeenCalledOnceWith(
      `${prefix} ${chalk.red("myerror")}`,
    );
  });
  it("logs additional parameters", () => {
    logger.info("a", "b");
    expect(myConsole.info).toHaveBeenCalledOnceWith(`${prefix} a`, "b");
  });
});

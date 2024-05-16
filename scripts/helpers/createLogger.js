import chalk from "chalk";
import formatDate from "date-fns/format";

const buildLogger =
  (logFunc, chalkFunc, dateFactory) =>
  (firstArg, ...restArgs) => {
    let newFirstArg = firstArg;
    if (typeof firstArg === "string") {
      const date = formatDate(dateFactory(), "HH:mm:ss.SSS");
      const prefix = chalk.white(`[${date}]`);
      newFirstArg = `${prefix} ${chalkFunc(firstArg)}`;
    }
    logFunc(newFirstArg, ...restArgs);
  };

const createLogger = (console, dateFactory) => {
  return {
    log: buildLogger(console.log.bind(console), (s) => s, dateFactory),
    info: buildLogger(console.info.bind(console), (s) => s, dateFactory),
    warn: buildLogger(console.warn.bind(console), chalk.yellow, dateFactory),
    error: buildLogger(console.error.bind(console), chalk.red, dateFactory),
  };
};

export default createLogger;

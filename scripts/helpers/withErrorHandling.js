const ApplicationError = require("./applicationError");

const withErrorHandling = async ({ logger, process }, operation, func) => {
  try {
    logger.info(`${operation}.`);
    await func();
    logger.info(`${operation} COMPLETE.`);
  } catch (e) {
    logger.error(`${operation} FAILED.`);
    if (e instanceof ApplicationError) {
      logger.error(e.message);
    } else {
      logger.error("An unexpected error was thrown.", e);
    }
    process.exit(1);
  }
};

module.exports = withErrorHandling;

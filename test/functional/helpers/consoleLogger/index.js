const createConsoleLogger = (context, logLevel) => {
  const t = context;
  const level = logLevel;
  let cursor = 0;

  const getNewMessages = async () => {
    let consoleMessages = await t.getBrowserConsoleMessages();
    consoleMessages = consoleMessages[level];
    const newMessages = consoleMessages.slice(cursor);
    cursor = consoleMessages.length;
    return newMessages;
  };

  const getAllMessages = async () => {
    let consoleMessages = await t.getBrowserConsoleMessages();
    consoleMessages = consoleMessages[level];
    cursor = consoleMessages.length;
    return consoleMessages;
  };

  return {
    t,
    level,
    getNewMessages,
    getAllMessages
  };
};

export default createConsoleLogger;

/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";

const logLevels = ["log", "info", "warn", "error"];

const containsMessageMatchingRegex = (messages, messageRegex) =>
  messages.find((message) => messageRegex.test(message)) !== undefined;

const formatFoundMessages = (messages) => {
  if (!messages.length) {
    return "No messages found.";
  }

  return `Messages found:\n${messages.join("\n")}`;
};

/**
 * Creates an object that can used for asserting the messages are or are not
 * logged. The assertions will be made again all messages that occur after the
 * logger has been created.
 *
 * For each log level (log, info, warn, error), there are assertion methods
 * available.
 *
 * For example, here is how you would test that, at the "warn"
 * log level, a message matching a given regex was logged:
 *
 * await logger.warn.expectMessageMatching(/test/);
 *
 * Here is how you would test that, at the "warn" log level, no messages
 * matching a given regex was logged:
 *
 * await logger.warn.expectNoMessageMatching(/test/);
 *
 * Here is how you would test that, at the "warn log level, no messages
 * were logged:
 *
 * await logger.warn.expectNoMessages();
 *
 * There is also a method directly on the logger that resets all messages at
 * all log levels:
 *
 * await logger.reset();
 */
const createConsoleLogger = async () => {
  let cursorByLogLevel;
  const updateCursorByLogLevel = (messages) => {
    cursorByLogLevel = logLevels.reduce((memo, logLevel) => {
      memo[logLevel] = messages[logLevel].length;
      return memo;
    }, {});
  };

  const messagesWhenCreated = await t.getBrowserConsoleMessages();
  updateCursorByLogLevel(messagesWhenCreated);

  // testCafe just calls toString on each parameter to the console log, so when
  // logging objects, it just shows [object Object]. So this JSON stringifys the
  // args and logs that.
  await t.eval(
    () => {
      logLevels.forEach((logLevel) => {
        const original = window.console[logLevel];
        window.console[logLevel] = (...args) => original(JSON.stringify(args));
      });
    },
    { dependencies: { logLevels } },
  );

  const getMessagesSinceReset = async (logLevel) => {
    const consoleMessages = await t.getBrowserConsoleMessages();
    const messagesForLevel = consoleMessages[logLevel];
    return messagesForLevel
      .slice(cursorByLogLevel[logLevel])
      .map((message) => JSON.parse(message));
  };

  const getMessagesSinceResetAsStrings = async (logLevel) => {
    const messages = await getMessagesSinceReset(logLevel);
    return messages.map((message) =>
      message.map((part) => part?.toString()).join(" "),
    );
  };

  const reset = async () => {
    const messages = await t.getBrowserConsoleMessages();
    updateCursorByLogLevel(messages);
  };

  const expectMessageMatching = async (logLevel, messageRegex) => {
    const messages = await getMessagesSinceResetAsStrings(logLevel);
    await t
      .expect(containsMessageMatchingRegex(messages, messageRegex))
      .ok(
        `No message was found at "${logLevel}" log level matching ${messageRegex}. ${formatFoundMessages(
          messages,
        )}`,
      );
  };

  const expectNoMessageMatching = async (logLevel, messageRegex) => {
    const messages = await getMessagesSinceResetAsStrings(logLevel);
    await t
      .expect(containsMessageMatchingRegex(messages, messageRegex))
      .notOk(
        `A message was found at "${logLevel}" log level matching ${messageRegex} when none was expected.`,
      );
  };

  const expectNoMessages = async (logLevel) => {
    const messages = await getMessagesSinceResetAsStrings(logLevel);
    await t
      .expect(messages.length)
      .notOk(
        `Messages were found "${logLevel}" at log level when none were expected. ${formatFoundMessages(
          messages,
        )}`,
      );
  };

  const methodsByLogLevel = logLevels.reduce((memo, logLevel) => {
    memo[logLevel] = {
      expectMessageMatching: expectMessageMatching.bind(null, logLevel),
      expectNoMessageMatching: expectNoMessageMatching.bind(null, logLevel),
      expectNoMessages: expectNoMessages.bind(null, logLevel),
      getMessagesSinceReset: getMessagesSinceReset.bind(null, logLevel),
    };
    return memo;
  }, {});

  return {
    reset,
    ...methodsByLogLevel,
  };
};

export default createConsoleLogger;

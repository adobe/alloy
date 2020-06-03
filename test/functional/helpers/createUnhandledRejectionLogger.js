import { t } from "testcafe";

const containsMessageMatchingRegex = (messages, messageRegex) => {
  return messages.find(message => messageRegex.test(message)) !== undefined;
};

const formatFoundMessages = messages => {
  if (!messages.length) {
    return "No messages found.";
  }
  return `Messages found:\n${messages.join("\n")}`;
};

/**
 * Creates an object that can used for asserting messages from unhandled
 * rejections. These are promises that were rejected, but unhandled.
 *
 * Example:
 *
 * const unhandledRejectionLogger = await createUnhandledRejectionLogger();
 * await unhandledRejectionLogger.expectMessageMatching(/test/);
 * await unhandledRejectionLogger.expectNoMessageMatching(/test/);
 * await unhandledRejectionLogger.reset();
 */
export default async () => {
  await t.eval(() => {
    window.testcafe_unhandled_rejections = [];
    window.addEventListener("unhandledrejection", ({ reason }) => {
      window.testcafe_unhandled_rejections.push(reason);
    });
  });

  const reset = async () => {
    await t.eval(() => {
      window.testcafe_unhandled_rejections.clear();
    });
  };

  const getMessagesSinceReset = async () => {
    return t.eval(() => {
      return window.testcafe_unhandled_rejections || [];
    });
  };

  const expectMessageMatching = async messageRegex => {
    const messages = await getMessagesSinceReset();
    await t
      .expect(containsMessageMatchingRegex(messages, messageRegex))
      .ok(
        `No unhandled rejection message was found matching ${messageRegex}. ${formatFoundMessages(
          messages
        )}`
      );
  };

  const expectNoMessageMatching = async messageRegex => {
    const messages = await getMessagesSinceReset();
    await t
      .expect(containsMessageMatchingRegex(messages, messageRegex))
      .notOk(
        `An unhandled rejection message was found matching ${messageRegex} when none was expected. ${formatFoundMessages(
          messages
        )}`
      );
  };

  return {
    reset,
    expectMessageMatching,
    expectNoMessageMatching
  };
};

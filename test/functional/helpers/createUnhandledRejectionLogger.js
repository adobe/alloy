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

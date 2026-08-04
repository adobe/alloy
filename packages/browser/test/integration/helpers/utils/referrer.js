/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
// @ts-check
/**
 * Temporarily overrides `document.referrer` for the duration of the callback,
 * restoring the original behavior afterward. alloy's injectWeb reads
 * `window.document.referrer` while building the request, so this lets a test
 * assert that a known referrer flows through into `web.webReferrer.URL`.
 *
 * The integration harness loads alloy into the same document as the test, so
 * `document` here is the same object alloy reads from. We shadow the prototype
 * getter with an own accessor and remove it in `finally`.
 *
 * @template T
 * @param {string} referrer - The value to expose via `document.referrer`.
 * @param {() => T | Promise<T>} operations
 * @returns {Promise<T>}
 *
 * @example
 * await withTemporaryReferrer("https://example.com/", () => alloy("sendEvent"));
 */
export const withTemporaryReferrer = async (referrer, operations) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    document,
    "referrer",
  );

  Object.defineProperty(document, "referrer", {
    configurable: true,
    get: () => referrer,
  });

  try {
    return await operations();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(document, "referrer", originalDescriptor);
    } else {
      delete document.referrer;
    }
  }
};

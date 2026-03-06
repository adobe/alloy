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
 * @template T
 * @param {(context: {
 *   currentHref: string,
 *   applyUrl: (nextUrl: string | URL, state?: unknown) => void,
 * }) => T | Promise<T>} operations
 * @returns {Promise<T>}
 *
 * @example
 * await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
 *   const url = new URL(currentHref);
 *   url.searchParams.set("s_kwcid", "test_keyword_123");
 *   applyUrl(url);
 *   await alloy("sendEvent");
 * });
 */
export const withTemporaryUrl = async (operations) => {
  const originalHref = window.location.href;
  const originalState = window.history.state;
  const originalUrl = new URL(originalHref);

  /** @type {(nextUrl: string | URL, state?: unknown) => void} */
  const applyUrl = (nextUrl, state = window.history.state) => {
    const targetUrl = new URL(String(nextUrl), originalHref);

    if (targetUrl.origin !== originalUrl.origin) {
      throw new Error("withTemporaryUrl only supports same-origin URLs.");
    }

    window.history.replaceState(state, "", targetUrl.toString());
  };

  try {
    return await operations({ currentHref: originalHref, applyUrl });
  } finally {
    window.history.replaceState(originalState, "", originalHref);
  }
};

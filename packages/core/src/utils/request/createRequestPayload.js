/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { RequestPayload, Identity } from './types.js' */

import { createMerger, prepareConfigOverridesForEdge } from "../index.js";

/**
 * createMerger creates a function that does a deep merge. Example:
 * ```js
 * payload.mergeConfigOverride({
 *   com_adobe_analytics: {
 *     reportSuites: ["reportSuite1"],
 *   },
 * });
 *
 * payload.mergeConfigOverride({
 *   com_adobe_analytics: {
 *     enabled: false,
 *   },
 * });
 *
 *
 * // payload.meta.configOverrides is now:
 * // {
 * //   com_adobe_analytics: {
 * //     enabled: false,
 * //     reportSuites: ["reportSuite1"],
 * //   },
 * // }
 * ```
 * however, we need the result to be:
 * ```js
 * // {
 * //   com_adobe_analytics: {
 * //     enabled: false,
 * //   },
 * // }
 * ```
 * aka a shallow merge, where the second object overwrites the first.
 * This is because order matters and we don't want to send reportSuites when something is
 * disabled.
 * This function does that.
 *
 * @param {Object} content
 * @param {string} key
 * @returns {(updates: Object) => void}
 */
const createMergeConfigOverride = (content, key) => (updates) => {
  const propertyPath = key.split(".");
  const hostObjectForUpdates = propertyPath.reduce((obj, propertyName) => {
    obj[propertyName] = obj[propertyName] || {};
    return obj[propertyName];
  }, content);

  Object.assign(hostObjectForUpdates, updates);
};

/**
 * Creates a request payload object with methods for merging different types of data.
 * This provides the base functionality that all types of request payloads share.
 *
 * @function
 *
 * @param {Object} options
 * @param {Object} options.content
 * @param {function(string, Identity): void} options.addIdentity
 * @param {function(string):  boolean} options.hasIdentity
 *
 * @returns {RequestPayload}
 */
export default (options) => {
  const { content, addIdentity, hasIdentity } = options;
  const mergeConfigOverrides = createMergeConfigOverride(
    content,
    "meta.configOverrides",
  );
  return {
    mergeMeta: createMerger(content, "meta"),
    mergeState: createMerger(content, "meta.state"),
    mergeQuery: createMerger(content, "query"),
    mergeConfigOverride: (updates) =>
      mergeConfigOverrides(prepareConfigOverridesForEdge(updates)),
    addIdentity,
    hasIdentity,
    toJSON() {
      return content;
    },
  };
};

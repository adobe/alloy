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

import { createMerger, prepareConfigOverridesForEdge } from "../index.js";
import type { Identity, RequestContent, RequestPayload } from "./types.js";

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
 */
const createMergeConfigOverride =
  (content: Record<string, unknown>, key: string) => (updates: object) => {
    const propertyPath = key.split(".");
    const hostObjectForUpdates = propertyPath.reduce<Record<string, unknown>>(
      (obj, propertyName) => {
        obj[propertyName] = obj[propertyName] || {};
        return obj[propertyName] as Record<string, unknown>;
      },
      content,
    );

    Object.assign(hostObjectForUpdates, updates);
  };

/**
 * Creates a request payload object with methods for merging different types of data.
 * This provides the base functionality that all types of request payloads share.
 *
 */
export default (options: {
  content: RequestContent;
  addIdentity: (namespaceCode: string, identity: Identity) => void;
  hasIdentity: (namespaceCode: string) => boolean;
}): RequestPayload => {
  const { content, addIdentity, hasIdentity } = options;
  const mergeConfigOverrides = createMergeConfigOverride(
    content,
    "meta.configOverrides",
  );
  return {
    mergeMeta: createMerger(content, "meta"),
    mergeState: createMerger(content, "meta.state"),
    mergeQuery: createMerger(content, "query"),
    mergeConfigOverride: (updates: object) => mergeConfigOverrides(updates),
    finalizeConfigOverrides: () => {
      if (content.meta?.configOverrides) {
        const prepared = prepareConfigOverridesForEdge(
          content.meta.configOverrides,
        );
        if (prepared === null) {
          delete content.meta.configOverrides;
        } else {
          content.meta.configOverrides = prepared;
        }
      }
    },
    addIdentity,
    hasIdentity,
    toJSON() {
      return content;
    },
  };
};

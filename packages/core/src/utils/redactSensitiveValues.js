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

import clone from "./clone.js";
import isObject from "./isObject.js";

const DEFAULT_SENSITIVE_KEY_PATTERN = /secret|password/i;

const redactInPlace = (value, pattern) => {
  if (Array.isArray(value)) {
    value.forEach((item) => redactInPlace(item, pattern));
  } else if (isObject(value)) {
    Object.keys(value).forEach((key) => {
      if (pattern.test(key)) {
        value[key] = "[REDACTED]";
      } else {
        redactInPlace(value[key], pattern);
      }
    });
  }
};

/**
 * Deep-clones `value`, redacting (replacing with `"[REDACTED]"`) any key
 * whose name matches `sensitiveKeyPattern`. Never mutates `value`.
 * @param {*} value
 * @param {RegExp} [sensitiveKeyPattern]
 * @returns {any}
 */
export default (value, sensitiveKeyPattern = DEFAULT_SENSITIVE_KEY_PATTERN) => {
  // clone() can't round-trip undefined (JSON.stringify(undefined) isn't a
  // string); callers pass a possibly-missing config/options unconditionally.
  if (value === undefined) {
    return undefined;
  }
  const redacted = clone(value);
  redactInPlace(redacted, sensitiveKeyPattern);
  return redacted;
};

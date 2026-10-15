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

/**
 * Returns `value` unchanged unless it has an `edgeCredentials.clientSecret`,
 * in which case it returns a shallow copy with that one value replaced by
 * `"[REDACTED]"`. Deliberately not a deep clone, so anything else on
 * `value` (including functions like `onBeforeEventSend`) survives as the
 * exact same reference.
 * @param {*} value
 * @returns {any}
 */
export default (value) => {
  if (
    !value?.edgeCredentials ||
    !Object.prototype.hasOwnProperty.call(value.edgeCredentials, "clientSecret")
  ) {
    return value;
  }
  return {
    ...value,
    edgeCredentials: {
      ...value.edgeCredentials,
      clientSecret: "[REDACTED]",
    },
  };
};

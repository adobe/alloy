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

/**
 * Represents a gateway response with the addition to helper methods.
 *
 * @param {Object} respDto The raw JSON response from the edge gateway
 *  - Current schema:
 * {
 *      requestId: {String},
 *      handle: [
 *          { type, payload }
 *      ]
 * }
 *
 * @returns {Object<Response>} A Response object containing:
 *  - `getPayloadsByType`: returns matching fragments of the response by type
 *      - @param {String} type: A string with the current format: <namespace:action>
 *          example: "identity:persist"
 */
export default (content = { requestId: "", handle: [] }) => {
  // TODO: Should we freeze the response to prevent change by Components?
  // Object.freeze(response.handle.map(h => Object.freeze(h)));
  return {
    getPayloadsByType(type) {
      const { handle = [] } = content;
      return handle
        .filter(fragment => fragment.type === type)
        .map(fragment => fragment.payload);
    },
    toJSON() {
      return content;
    }
    // TODO: Maybe consider the following API as well?
    // - getPayloadsByAction
  };
};

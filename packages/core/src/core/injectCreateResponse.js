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
import { ADOBE_EDGE } from "../constants/httpHeaderNames.js";

/**
 * Creates a representation of a gateway response with the addition of
 * helper methods.
 * @returns Response
 */
export default ({ extractEdgeInfo }) =>
  ({ content = {}, getHeader }) => {
    const { handle = [], errors = [], warnings = [] } = content;

    /**
     * Response object.
     * @typedef {Object} Response
     */
    return {
      /**
       * Returns matching fragments of the response by type.
       * @param {String} type A string with the current format: <namespace:action>
       *
       * @example
       * getPayloadsByType("identity:persist")
       */
      getPayloadsByType(type) {
        return handle
          .filter((fragment) => fragment.type === type)
          .flatMap((fragment) => fragment.payload);
      },
      /**
       * Returns all errors.
       */
      getErrors() {
        return errors;
      },
      /**
       * Returns all warnings.
       */
      getWarnings() {
        return warnings;
      },
      /**
       * Returns an object containing the regionId from the x-adobe-edge header
       */
      getEdge() {
        return extractEdgeInfo(getHeader(ADOBE_EDGE));
      },
      toJSON() {
        return content;
      },
    };
  };

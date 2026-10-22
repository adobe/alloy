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
import type { Response, ResponseCreator } from "./types.js";

export interface InjectCreateResponseOptions {
  extractEdgeInfo: (header: string | null | undefined) => {
    regionId?: number;
  };
}

/**
 * Creates a representation of a gateway response with the addition of
 * helper methods.
 *
 */
export default ({
    extractEdgeInfo,
  }: InjectCreateResponseOptions): ResponseCreator =>
  ({ content = {}, getHeader }): Response => {
    const { handle = [], errors = [], warnings = [] } = content;

    return {
      /**
       * Returns matching fragments of the response by type.
       * @param type - A string with the current format: <namespace:action>
       *
       * @example
       * getPayloadsByType("identity:persist")
       */
      getPayloadsByType<T = unknown>(type: string) {
        // The caller names the payload shape Edge sends for this type.
        return handle
          .filter((fragment) => fragment.type === type)
          .flatMap((fragment) => fragment.payload) as T[];
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

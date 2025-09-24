/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { Request, RequestPayload } from './types.js' */

import { uuid } from "../index.js";

/**
 * Creates a request object with methods to access and modify request properties.
 *
 * @function
 *
 * @param {Object} options
 * @param {RequestPayload} options.payload
 * @param {function({isIdentityEstablished: boolean}): string} options.getAction
 * @param {function({isIdentityEstablished: boolean}): boolean} options.getUseSendBeacon
 * @param {string} [options.datastreamIdOverride]
 * @param {string} [options.edgeSubPath]
 *
 * @returns {Request}
 *
 * @example
 * const request = createRequest({
 *   payload: { event: 'pageView' },
 *   getAction: ({ isIdentityEstablished }) => isIdentityEstablished ? 'send' : 'queue',
 *   getUseSendBeacon: ({ isIdentityEstablished }) => isIdentityEstablished,
 *   datastreamIdOverride: 'custom-datastream-id',
 *   edgeSubPath: 'custom/path'
 * });
 *
 * console.log(request.getId()); // Returns unique UUID
 * request.setIsIdentityEstablished();
 * console.log(request.getAction()); // Returns action based on identity status
 */
export default (options) => {
  const {
    payload,
    getAction,
    getUseSendBeacon,
    datastreamIdOverride,
    edgeSubPath,
  } = options;

  const id = uuid();
  let shouldUseThirdPartyDomain = false;
  let isIdentityEstablished = false;

  return {
    getId() {
      return id;
    },
    getPayload() {
      return payload;
    },
    getAction() {
      return getAction({ isIdentityEstablished });
    },
    getDatastreamIdOverride() {
      return datastreamIdOverride;
    },
    getUseSendBeacon() {
      return getUseSendBeacon({ isIdentityEstablished });
    },
    getEdgeSubPath() {
      if (edgeSubPath) {
        return edgeSubPath;
      }
      return "";
    },
    getUseIdThirdPartyDomain() {
      return shouldUseThirdPartyDomain;
    },
    setUseIdThirdPartyDomain() {
      shouldUseThirdPartyDomain = true;
    },
    setIsIdentityEstablished() {
      isIdentityEstablished = true;
    },
  };
};

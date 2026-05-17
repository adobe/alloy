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

/** @import { NetworkService } from "@adobe/alloy-core/services" */

import injectSendFetchRequest from "@adobe/alloy-core/core/network/requestMethods/injectSendFetchRequest.js";
import injectSendBeaconRequest from "@adobe/alloy-core/core/network/requestMethods/injectSendBeaconRequest.js";

/**
 * Browser implementation of {@link NetworkService}. Uses the global `fetch`
 * for normal requests and `navigator.sendBeacon` (when available) for
 * unload-time delivery, falling back to `fetch` otherwise.
 *
 * @param {{ logger: import('@adobe/alloy-core/core/types.js').Logger }} dependencies
 * @returns {NetworkService}
 */
const createBrowserNetworkService = ({ logger }) => {
  const { fetch, navigator } = window;
  const sendFetchRequest = injectSendFetchRequest({ fetch });
  const sendBeaconRequest =
    typeof navigator.sendBeacon === "function"
      ? injectSendBeaconRequest({
          // Without the bind(), the browser will complain about an illegal invocation.
          sendBeacon: navigator.sendBeacon.bind(navigator),
          sendFetchRequest,
          logger,
        })
      : sendFetchRequest;

  return {
    sendFetchRequest,
    sendBeaconRequest,
  };
};

export default createBrowserNetworkService;

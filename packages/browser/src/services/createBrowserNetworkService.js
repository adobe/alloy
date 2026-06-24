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

/**
 * @returns {NetworkService}
 */
const createBrowserNetworkService = () => {
  const { fetch, navigator } = window;
  const sendFetchRequest = injectSendFetchRequest({ fetch });
  const sendBeacon =
    typeof navigator.sendBeacon === "function"
      ? navigator.sendBeacon.bind(navigator)
      : null;

  return {
    sendFetchRequest,
    sendBeacon,
  };
};

export default createBrowserNetworkService;

/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import murmurHash128GuavaHex from "../utils/murmurHash128GuavaHex.js";
import { HASHED_IP_ADDR } from "../constants/index.js";

export default ({ cookieManager, hash = murmurHash128GuavaHex }) => {
  let cached = cookieManager.getValue(HASHED_IP_ADDR) || "";

  const captureFromIframe = (clientIp) => {
    if (!clientIp) return;
    cached = hash(clientIp);
    cookieManager.setValue(HASHED_IP_ADDR, cached);
  };

  return {
    captureFromIframe,
    get: () => cached,
    collect: (initiateCallFn) => {
      if (cached) return Promise.resolve(cached);
      return initiateCallFn().then((result) => {
        captureFromIframe(result.clientIp);
        return cached;
      });
    },
  };
};

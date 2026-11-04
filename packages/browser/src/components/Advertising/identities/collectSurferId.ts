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

import type { ComponentTools } from "@adobe/alloy-core/core/types.js";
import type {
  AdvertisingIdentityResult,
  CookieManager,
  IdentityCollector,
} from "../types.js";
import {
  DISPLAY_CLICK_COOKIE_KEY,
  SURFER_ID,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
} from "../constants/index.js";
import { injectAreThirdPartyCookiesSupportedByDefault } from "@adobe/alloy-core/utils";

/**
 * Factory for surferId collection. Cache lives at closure scope — no module-level state.
 */
const createCollectSurferId = ({
  initiateAdvertisingIdentityCall,
  cookieManager,
  getBrowser,
}: {
  initiateAdvertisingIdentityCall: () => Promise<AdvertisingIdentityResult>;
  cookieManager: CookieManager;
  getBrowser: ComponentTools["getBrowser"];
}): IdentityCollector => {
  let cachedSurferId = cookieManager.getValue<string>(SURFER_ID) || "";

  return (resolveSurferIdIfNotAvailable = true) => {
    if (cachedSurferId) {
      return Promise.resolve(cachedSurferId);
    }

    if (!resolveSurferIdIfNotAvailable) {
      return Promise.resolve(null);
    }

    return initiateAdvertisingIdentityCall().then((resolvedId) => {
      const areThirdPartyCookiesSupported =
        !getBrowser ||
        injectAreThirdPartyCookiesSupportedByDefault({ getBrowser })();

      if (resolvedId && areThirdPartyCookiesSupported) {
        if (resolvedId.surferId) {
          cachedSurferId = resolvedId.surferId;
          cookieManager.setValue(SURFER_ID, resolvedId.surferId);
        }
        if (resolvedId.displayClickCookie) {
          cookieManager.setValue(
            DISPLAY_CLICK_COOKIE_KEY,
            resolvedId.displayClickCookie,
          );
          cookieManager.setValue(
            DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
            Date.now() + 15 * 60 * 1000,
          );
        }
      }

      return areThirdPartyCookiesSupported ? resolvedId.surferId : null;
    });
  };
};

export default createCollectSurferId;

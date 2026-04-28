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

import {
  DISPLAY_CLICK_COOKIE_KEY,
  SURFER_ID,
  HASHED_IP_ADDR,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
} from "../constants/index.js";
import { injectAreThirdPartyCookiesSupportedByDefault } from "../../../utils/index.js";
import { setHashedIPAddr } from "./collectHashedIP.js";
import { initiateAdvertisingIdentityCall } from "./initiateAdvertisingIdentityCall.js";

let surferId = "";

const collectSurferId = function collectSurferId(
  cookieManager,
  getBrowser,
  resolveSurferIdIfNotAvailable = true,
) {
  if (surferId && surferId !== "") {
    return Promise.resolve(surferId);
  }

  if (cookieManager) {
    const cookieSurferId = cookieManager.getValue(SURFER_ID);
    if (cookieSurferId) {
      surferId = cookieSurferId;
      const cookieHashedIPAddr = cookieManager.getValue(HASHED_IP_ADDR);
      if (cookieHashedIPAddr) {
        setHashedIPAddr(cookieHashedIPAddr);
      }
      return Promise.resolve(cookieSurferId);
    }
  }

  if (resolveSurferIdIfNotAvailable) {
    return initiateAdvertisingIdentityCall().then((resolvedId) => {
      if (resolvedId.surferId) {
        surferId = resolvedId.surferId;
      }

      const areThirdPartyCookiesSupported =
        !getBrowser ||
        injectAreThirdPartyCookiesSupportedByDefault({ getBrowser })();

      if (cookieManager && resolvedId) {
        if (resolvedId.hashedIPAddr) {
          cookieManager.setValue(HASHED_IP_ADDR, resolvedId.hashedIPAddr);
        }
        if (areThirdPartyCookiesSupported) {
          if (resolvedId.surferId) {
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
      }
      return areThirdPartyCookiesSupported ? resolvedId.surferId : null;
    });
  }
  return Promise.resolve(null);
};

export default collectSurferId;

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
  SURFER_PIXEL_HOST,
  SURFER_USER_ID,
  SURFER_TIMEOUT_MS,
  SURFER_TRUSTED_ORIGIN,
  SURFER_PARAM_KEY,
  DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
} from "../constants/index.js";
import createNode from "../../../utils/dom/createNode.js";
import { injectAreThirdPartyCookiesSupportedByDefault } from "../../../utils/index.js";

let surferId = "";
let displayClickCookie = "";
let inProgressSurferPromise = null;

const addToDom = (element) => {
  if (document.body) {
    document.body.appendChild(element);
  } else {
    window.addEventListener(
      "load",
      () => {
        document.body.appendChild(element);
      },
      false,
    );
  }
};

const getInvisibleIframeElement = (url) =>
  createNode(
    "iframe",
    { src: url },
    {
      height: 0,
      width: 0,
      frameBorder: 0,
      style: { display: "none" },
    },
    [],
  );

const addListener = (fn) => window.addEventListener("message", fn, false);

const removeListener = (fn) => window.removeEventListener("message", fn, false);

const initiateAdvertisingIdentityCall = () => {
  if (inProgressSurferPromise) {
    return inProgressSurferPromise;
  }

  inProgressSurferPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const scheme =
        document.location.protocol === "https:" ? "https:" : "http:";

      const nestedParams = new URLSearchParams({
        google: "__EFGCK__",
        gsurfer: "__EFGSURFER__",
        imsId: "__EFIMSORGID__",
        is_fb_cookie_synced: "__EFFB__",
        optout: "__EFOPTOUT__",
        throttleCookie: "__EFSYNC__",
        time: "__EFTIME__",
        ev_lcc: "__LCC__",
      });
      const nestedUrl = `${scheme}//www.everestjs.net/static/pixel_details.html#${nestedParams.toString()}`;

      const mainParams = new URLSearchParams({
        ev_gb: "0",
        url: nestedUrl,
      });
      const pixelDetailsUrl = `${scheme}//${SURFER_PIXEL_HOST}/${SURFER_USER_ID}/gr?${mainParams.toString()}`;

      const iframeElement = getInvisibleIframeElement(pixelDetailsUrl);
      addToDom(iframeElement);

      const pixelDetailsReceiver = function pixelDetailsReceiver(message) {
        if (!message.origin.includes(SURFER_TRUSTED_ORIGIN)) {
          return;
        }

        try {
          const pixelRedirectUri = message.data;
          const hashIndex = pixelRedirectUri.indexOf("#");
          if (hashIndex === -1) {
            resolve({ surferId: null, displayClickCookie: null });
            return;
          }

          const hashParams = new URLSearchParams(
            pixelRedirectUri.substring(hashIndex + 1),
          );
          let resolvedSurferId;
          let resolvedDisplayClickCookie;

          const surferValue = hashParams.get(SURFER_PARAM_KEY);
          if (surferValue) {
            resolvedSurferId = surferValue;
          }

          const displayClickValue = hashParams.get(DISPLAY_CLICK_COOKIE_KEY);
          if (displayClickValue && displayClickValue !== "__LCC__") {
            resolvedDisplayClickCookie = displayClickValue;
          }

          removeListener(pixelDetailsReceiver);

          if (resolvedSurferId) {
            surferId = resolvedSurferId;
            displayClickCookie = resolvedDisplayClickCookie;
            resolve({ surferId, displayClickCookie });
          } else {
            resolve({ surferId: null, displayClickCookie: null });
          }
        } catch (err) {
          reject(err);
        } finally {
          inProgressSurferPromise = null;
        }
      };

      addListener(pixelDetailsReceiver);
    }, SURFER_TIMEOUT_MS);
  });

  return inProgressSurferPromise;
};

const collectSurferId = function collectSurferId(
  cookieManager,
  getBrowser,
  resolveSurferIdIfNotAvailable = true,
) {
  if (getBrowser) {
    const areThirdPartyCookiesSupportedByDefault =
      injectAreThirdPartyCookiesSupportedByDefault({ getBrowser });

    if (!areThirdPartyCookiesSupportedByDefault()) {
      return Promise.resolve(null);
    }
  }

  if (surferId && surferId !== "") {
    return Promise.resolve(surferId);
  }

  if (cookieManager) {
    const cookieSurferId = cookieManager.getValue(SURFER_ID);
    if (cookieSurferId) {
      surferId = cookieSurferId;
      return Promise.resolve(cookieSurferId);
    }
  }

  if (resolveSurferIdIfNotAvailable) {
    return initiateAdvertisingIdentityCall().then((resolvedId) => {
      if (cookieManager && resolvedId) {
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
      return resolvedId.surferId;
    });
  }
  return Promise.resolve(null);
};

export default collectSurferId;

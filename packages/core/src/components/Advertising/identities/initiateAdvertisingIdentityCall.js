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
  SURFER_PIXEL_HOST,
  SURFER_USER_ID,
  SURFER_TIMEOUT_MS,
  SURFER_TRUSTED_ORIGIN,
  SURFER_PARAM_KEY,
  SURFER_IP,
} from "../constants/index.js";
import createNode from "../../../utils/dom/createNode.js";

let inProgressPromise = null;

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

/**
 * Initiates the advertising identity iframe request. Shared by collectSurferId and
 * collectHashedIP flows. Resolves with { surferId, displayClickCookie, hashedIPAddr }.
 * Hashed IP is extracted from hash params (clientIp) and set in collectHashedIP via setHashedIPAddr.
 * @returns {Promise<{ surferId: string|null, displayClickCookie: string|null, hashedIPAddr: string }>}
 */
export const initiateAdvertisingIdentityCall = () => {
  if (inProgressPromise) {
    return inProgressPromise;
  }

  inProgressPromise = new Promise((resolve, reject) => {
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
        clientIp: "__EFREMOTEADDR__",
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
            resolve({
              surferId: null,
              displayClickCookie: null,
              clientIp: "",
            });
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

          const clientIp = hashParams.get(SURFER_IP) || "";

          const displayClickValue = hashParams.get(DISPLAY_CLICK_COOKIE_KEY);
          if (displayClickValue && displayClickValue !== "__LCC__") {
            resolvedDisplayClickCookie = displayClickValue;
          }

          removeListener(pixelDetailsReceiver);

          if (resolvedSurferId) {
            resolve({
              surferId: resolvedSurferId,
              displayClickCookie: resolvedDisplayClickCookie,
              clientIp,
            });
          } else {
            resolve({
              surferId: null,
              displayClickCookie: null,
              clientIp: "",
            });
          }
        } catch (err) {
          reject(err);
        } finally {
          inProgressPromise = null;
        }
      };

      addListener(pixelDetailsReceiver);
    }, SURFER_TIMEOUT_MS);
  });

  return inProgressPromise;
};

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
import {
  appendNode,
  awaitSelector,
  createNode,
} from "@adobe/alloy-core/utils/dom/index.js";
import { BODY } from "@adobe/alloy-core/constants/tagName.js";

const IFRAME_PROPS = {
  height: 0,
  width: 0,
  frameBorder: 0,
  style: { display: "none" },
};

/**
 * Creates a shared advertising identity caller. Both the SurferID and hashed-IP
 * flows call this so the pixel iframe is only loaded once per page per request.
 *
 * @param {Object} [deps]
 * @param {Function} [deps.appendNode]
 * @param {Function} [deps.awaitSelector]
 * @param {Function} [deps.createNode]
 * @returns {Function} initiateAdvertisingIdentityCall
 */
export const createInitiateAdvertisingIdentityCall = ({
  appendNode: appendNodeFn = appendNode,
  awaitSelector: awaitSelectorFn = awaitSelector,
  createNode: createNodeFn = createNode,
} = {}) => {
  let inProgressPromise = null;

  /**
   * Initiates the advertising identity iframe request. Shared by SurferID
   * and hashed-IP flows so the pixel is only loaded once per page.
   * `clientIp` is the raw IP — hashing is the caller's responsibility
   * (see createHashedIpHandler).
   * @returns {Promise<{ surferId: string|null, displayClickCookie: string|null, clientIp: string }>}
   */
  return () => {
    if (inProgressPromise) {
      return inProgressPromise;
    }

    inProgressPromise = new Promise((resolve, reject) => {
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

      const iframeElement = createNodeFn(
        "iframe",
        { src: pixelDetailsUrl },
        IFRAME_PROPS,
        [],
      );

      let timeoutId;

      // Single cleanup — called on every exit path (success, no-hash, error, timeout)
      // so the listener and timer never leak.
      const pixelDetailsReceiver = (message) => {
        if (!message.origin.includes(SURFER_TRUSTED_ORIGIN)) {
          return;
        }

        clearTimeout(timeoutId);
        window.removeEventListener("message", pixelDetailsReceiver, false);

        try {
          const pixelRedirectUri = message.data;
          const hashIndex = pixelRedirectUri.indexOf("#");

          if (hashIndex === -1) {
            resolve({ surferId: null, displayClickCookie: null, clientIp: "" });
            return;
          }

          const hashParams = new URLSearchParams(
            pixelRedirectUri.substring(hashIndex + 1),
          );

          const surferValue = hashParams.get(SURFER_PARAM_KEY) || null;
          const clientIp = hashParams.get(SURFER_IP) || "";
          const displayClickValue = hashParams.get(DISPLAY_CLICK_COOKIE_KEY);
          const displayClickCookie =
            displayClickValue && displayClickValue !== "__LCC__"
              ? displayClickValue
              : null;

          resolve({ surferId: surferValue, displayClickCookie, clientIp });
        } catch (err) {
          reject(err);
        }
      };

      // Reject if the iframe never responds (ad blocker, CSP, network failure, etc.)
      timeoutId = setTimeout(() => {
        window.removeEventListener("message", pixelDetailsReceiver, false);
        reject(new Error("Advertising identity call timed out"));
      }, SURFER_TIMEOUT_MS);

      window.addEventListener("message", pixelDetailsReceiver, false);

      // Use awaitSelector(BODY) — consistent with injectFireReferrerHideableImage.js
      // and more robust than document.body check + load event fallback.
      awaitSelectorFn(BODY).then(([body]) => {
        appendNodeFn(body, iframeElement);
      });
    }).finally(() => {
      inProgressPromise = null;
    });

    return inProgressPromise;
  };
};

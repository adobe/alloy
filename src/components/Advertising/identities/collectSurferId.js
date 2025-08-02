/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed under the Apache License, Version 2.0.
*/

import {
  DISPLAY_CLICK_COOKIE_KEY,
  SURFER_ID,
  SURFER_PIXEL_HOST,
  SURFER_USER_ID,
  SURFER_TIMEOUT_MS,
  SURFER_TRUSTED_ORIGIN,
  SURFER_PARAM_KEY,
} from "../constants/index.js";
import createNode from "../../../utils/dom/createNode.js";
import { injectAreThirdPartyCookiesSupportedByDefault } from "../../../utils/index.js";

// Global thread-safe storage (similar to fetchID5Id.js pattern)
let surferId = "";
let displayClickCookie = "";
let inProgressSurferPromise = null; // Store the in-progress promise

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
    { src: url }, // attrs
    {
      height: 0,
      width: 0,
      frameBorder: 0,
      style: { display: "none" },
    }, // props
    [], // children
  );

const addListener = (fn) => window.addEventListener("message", fn, false);

const removeListener = (fn) => window.removeEventListener("message", fn, false);

const initiateAdvertisingIdentityCall = () => {
  // If there's already a fetch in progress, return that promise
  if (inProgressSurferPromise) {
    return inProgressSurferPromise;
  }

  inProgressSurferPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const scheme =
        document.location.protocol === "https:" ? "https:" : "http:";

      // Build the nested URL parameters using URLSearchParams
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

      // Build the main URL parameters
      const mainParams = new URLSearchParams({
        ev_gb: "0",
        url: nestedUrl,
      });
      const pixelDetailsUrl = `${scheme}//${SURFER_PIXEL_HOST}/${SURFER_USER_ID}/gr?${mainParams.toString()}`;

      const iframeElement = getInvisibleIframeElement(pixelDetailsUrl);
      addToDom(iframeElement);

      const pixelDetailsReceiver = function pixelDetailsReceiver(message) {
        if (!message.origin.includes(SURFER_TRUSTED_ORIGIN)) {
          // Ignored message from untrusted origin - handle silently
          return;
        }

        // Received message from pixel iframe - handle silently in production

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
            // No surferId found in message data - handle silently
            resolve({ surferId: null, displayClickCookie: null });
          }
        } catch (err) {
          // Error processing pixel response - handle silently
          reject(err);
        } finally {
          inProgressSurferPromise = null; // Clear stored promise regardless of outcome
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
  // Check if browser supports third-party cookies by default
  if (getBrowser) {
    const areThirdPartyCookiesSupportedByDefault =
      injectAreThirdPartyCookiesSupportedByDefault({ getBrowser });

    if (!areThirdPartyCookiesSupportedByDefault()) {
      return Promise.resolve(null);
    }
  }

  // Check if Surfer ID is already initialized in memory
  if (surferId && surferId !== "") {
    return Promise.resolve(surferId);
  }

  // If not in memory, check if available in cookie using cookieManager
  if (cookieManager) {
    const cookieSurferId = cookieManager.getValue(SURFER_ID);
    if (cookieSurferId) {
      // Update in-memory value
      surferId = cookieSurferId;
      return Promise.resolve(cookieSurferId);
    }
  }

  if (resolveSurferIdIfNotAvailable) {
    // If not in memory or cookie, initialize and store in cookie
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
        }
      }
      return resolvedId.surferId;
    });
  }
  return Promise.resolve(null);
};

export default collectSurferId;

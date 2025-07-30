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
      const pixelDetailsUrl = `${scheme}//${SURFER_PIXEL_HOST}/${SURFER_USER_ID}/gr?ev_gb=0&url=${scheme}%2F%2Fwww.everestjs.net%2Fstatic%2Fpixel_details.html%23google%3D__EFGCK__%26gsurfer%3D__EFGSURFER__%26imsId%3D__EFIMSORGID__%26is_fb_cookie_synced%3D__EFFB__%26optout%3D__EFOPTOUT__%26throttleCookie%3D__EFSYNC__%26time%3D__EFTIME__%26ev_lcc%3D__LCC__`;
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
          const hashParams = pixelRedirectUri
            .substring(pixelRedirectUri.indexOf("#") + 1)
            .split("&");
          let resolvedSurferId;
          let resolvedDisplayClickCookie;
          for (const param of hashParams) {
            const parts = param.split("=");
            if (parts[0] === SURFER_PARAM_KEY && parts[1]) {
              resolvedSurferId = parts[1];
            } else if (
              parts[0] === DISPLAY_CLICK_COOKIE_KEY &&
              parts[1] &&
              parts[1] !== "__LCC__"
            ) {
              resolvedDisplayClickCookie = parts[1];
            }
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
  resolveSurferIdIfNotAvailable = true,
) {
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

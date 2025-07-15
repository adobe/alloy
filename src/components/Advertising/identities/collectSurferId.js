/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed under the Apache License, Version 2.0.
*/

import { DISPLAY_CLICK_COOKIE_KEY, SURFER_ID } from "../constants/index.js";

const pixelHost = "pixel.everesttech.net";
const userId = "1";

// Global thread-safe storage (similar to fetchID5Id.js pattern)
let surferId = "";
let displayClickCookie = "";
let inProgressSurferPromise = null; // Store the in-progress promise

const addToDom = function addToDom(element) {
  if (document.body) {
    document.body.appendChild(element);
  } else if (window.addEventListener) {
    window.addEventListener(
      "load",
      function loadHandler() {
        document.body.appendChild(element);
      },
      false,
    );
  } else {
    window.attachEvent("onload", function onloadHandler() {
      document.body.appendChild(element);
    });
  }
};

const getInvisibleIframeElement = function getInvisibleIframeElement(url) {
  const iframe = document.createElement("iframe");
  if (url !== undefined) {
    iframe.src = url;
  }
  iframe.height = 0;
  iframe.width = 0;
  iframe.frameBorder = 0;
  iframe.style.display = "none";
  return iframe;
};

const addListener = function addListener(fn) {
  if (window.addEventListener) {
    window.addEventListener("message", fn, false);
  } else {
    window.attachEvent("onmessage", fn);
  }
};

const removeListener = function removeListener(fn) {
  if (window.removeEventListener) {
    window.removeEventListener("message", fn, false);
  } else {
    window.detachEvent("onmessage", fn);
  }
};

const initiateAdvertisingIdentityCall =
  function initiateAdvertisingIdentityCall() {
    // If there's already a fetch in progress, return that promise
    if (inProgressSurferPromise) {
      return inProgressSurferPromise;
    }

    inProgressSurferPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const scheme =
          document.location.protocol === "https:" ? "https:" : "http:";
        const pixelDetailsUrl = `${scheme}//${pixelHost}/${userId}/gr?ev_gb=0&url=${scheme}%2F%2Fwww.everestjs.net%2Fstatic%2Fpixel_details.html%23google%3D__EFGCK__%26gsurfer%3D__EFGSURFER__%26imsId%3D__EFIMSORGID__%26is_fb_cookie_synced%3D__EFFB__%26optout%3D__EFOPTOUT__%26throttleCookie%3D__EFSYNC__%26time%3D__EFTIME__%26ev_lcc%3D__LCC__`;
        const iframeElement = getInvisibleIframeElement(pixelDetailsUrl);
        addToDom(iframeElement);

        const pixelDetailsReceiver = function pixelDetailsReceiver(message) {
          if (!message.origin.includes("www.everestjs.net")) {
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
            for (let i = 0; i < hashParams.length; i += 1) {
              const parts = hashParams[i].split("=");
              if (parts[0] === "gsurfer" && parts[1]) {
                resolvedSurferId = parts[1];
              } else if (parts[0] === DISPLAY_CLICK_COOKIE_KEY && parts[1]) {
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
      }, 5000);
    });

    return inProgressSurferPromise;
  };

const getSurferId = function getSurferId(
  cookieManager,
  resolveSurferIdIfNotAvailable = true,
) {
  // Check if Surfer ID is already initialized in memory
  if (surferId && surferId !== "") {
    return Promise.resolve(surferId);
  }

  // If not in memory, check if available in cookie using cookieManager
  if (cookieManager) {
    try {
      const cookieSurferId = cookieManager.getValueWithLastUpdated(SURFER_ID);
      if (cookieSurferId) {
        // Update in-memory value
        surferId = cookieSurferId;
        return Promise.resolve(cookieSurferId);
      }
    } catch {
      // Error reading surferId from cookie - handle silently
    }
  }

  if (resolveSurferIdIfNotAvailable) {
    // If not in memory or cookie, initialize and store in cookie
    return initiateAdvertisingIdentityCall().then((resolvedId) => {
      if (cookieManager && resolvedId) {
        if (resolvedId.surferId) {
          cookieManager.setValueWithLastUpdated(SURFER_ID, resolvedId.surferId);
        }
        if (resolvedId.displayClickCookie) {
          cookieManager.setValueWithLastUpdated(
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

// Export the functions for use in other modules
export { getSurferId };

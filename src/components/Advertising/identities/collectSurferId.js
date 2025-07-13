/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed under the Apache License, Version 2.0.
*/

const pixelHost = "pixel.everesttech.net";
const userId = "11076";

// Global thread-safe storage (similar to fetchID5Id.js pattern)
let surferId = "";
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
  function initiateAdvertisingIdentityCall(cookieManager = null) {
    // If there's already a fetch in progress, return that promise
    if (inProgressSurferPromise) {
      return inProgressSurferPromise;
    }

    inProgressSurferPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const scheme =
          document.location.protocol === "https:" ? "https:" : "http:";
        const pixelDetailsUrl = `${scheme}//${pixelHost}/${userId}/gr?ev_gb=0&url=${scheme}//www.everestjs.net%2Fstatic%2Fpixel_details.html%23gsurfer%3D__EFGSURFER__`;
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

            for (let i = 0; i < hashParams.length; i += 1) {
              const parts = hashParams[i].split("=");
              if (parts[0] === "gsurfer" && parts[1]) {
                resolvedSurferId = parts[1];
                break;
              }
            }

            removeListener(pixelDetailsReceiver);

            if (resolvedSurferId) {
              // Check if surfer_id has changed by comparing with existing cookie value
              if (cookieManager) {
                try {
                  cookieManager.getValue("surfer_id");
                } catch {
                  // Error reading existing surferId from cookie
                }
              }

              surferId = resolvedSurferId;
              resolve(resolvedSurferId);
            } else {
              // No surferId found in message data - handle silently
              resolve(null);
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

// Store surferId in cookie using cookieManager
const storeSurferIdInCookie = function storeSurferIdInCookie(
  cookieManager,
  surferIdValue,
) {
  if (cookieManager && surferIdValue) {
    try {
      cookieManager.setValueWithLastUpdated("surfer_id", surferIdValue);
      return true;
    } catch {
      // Error storing surferId in cookie - handle silently
      return false;
    }
  }
  return false;
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
      const cookieSurferId = cookieManager.getValueWithLastUpdated("surfer_id");
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
    return initiateAdvertisingIdentityCall(cookieManager).then((resolvedId) => {
      if (cookieManager && resolvedId) {
        storeSurferIdInCookie(cookieManager, resolvedId);
      }
      return resolvedId;
    });
  }
  return Promise.resolve(null);
};

// Export the functions for use in other modules
export { getSurferId };

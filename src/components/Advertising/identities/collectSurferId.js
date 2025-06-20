/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed under the Apache License, Version 2.0.
*/

const pixelHost = "pixel.everesttech.net";
const userId = "11076";

// Global thread-safe storage (similar to fetchID5Id.js pattern)
let surferId = "";
let inProgressSurferPromise = null; // Store the in-progress promise
let surferIdHasChanged = true; // Flag to track if surfer_id has changed from cookie, and control if conversion event is fired or not

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
  function initiateAdvertisingIdentityCall(sessionManager = null) {
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
              let existingSurferId = null;
              if (sessionManager) {
                try {
                  existingSurferId = sessionManager.getValue("surfer_id");
                } catch {
                  // Error reading existing surferId from cookie
                }
              }

              // Set the change flag: true if different or no existing value, false if same
              surferIdHasChanged =
                !existingSurferId || existingSurferId !== resolvedSurferId;
              surferId = resolvedSurferId;
              resolve(resolvedSurferId);
            } else {
              // No surferId found in message data - handle silently
              surferIdHasChanged = true; // in safari if surfer_id not resolve still fire rampid call
              resolve(null);
            }
          } catch (err) {
            // Error processing pixel response - handle silently
            surferIdHasChanged = true; // in safari if surfer_id not resolve still fire rampid call
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

// Store surferId in cookie using sessionManager
const storeSurferIdInCookie = function storeSurferIdInCookie(
  sessionManager,
  surferIdValue,
) {
  if (sessionManager && surferIdValue) {
    try {
      sessionManager.setValueWithLastUpdated("surfer_id", surferIdValue);
      return true;
    } catch {
      // Error storing surferId in cookie - handle silently
      return false;
    }
  }
  return false;
};

const getSurferId = function getSurferId(
  sessionManager,
  resolveSurferIdIfNotAvailable = true,
) {
  // Check if Surfer ID is already initialized in memory
  if (surferId && surferId !== "") {
    return Promise.resolve(surferId);
  }

  // If not in memory, check if available in cookie using sessionManager
  if (sessionManager) {
    try {
      const cookieSurferId =
        sessionManager.getValueWithLastUpdated("surfer_id");
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
    return initiateAdvertisingIdentityCall(sessionManager).then(
      (resolvedId) => {
        if (sessionManager && resolvedId) {
          storeSurferIdInCookie(sessionManager, resolvedId);
        }
        return resolvedId;
      },
    );
  }
  return Promise.resolve(null);
};

// Expose function to check if surfer_id has changed
const hasSurferIdChanged = function hasSurferIdChanged() {
  return surferIdHasChanged;
};

// Export the functions for use in other modules
export { getSurferId, hasSurferIdChanged };

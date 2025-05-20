/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed under the Apache License, Version 2.0.
*/

const pixelHost = "pixel.everesttech.net";
const userId = "11076";

const addToDom = function (element) {
  if (document.body) {
    document.body.appendChild(element);
  } else if (window.addEventListener) {
    window.addEventListener(
      "load",
      function () {
        document.body.appendChild(element);
      },
      false,
    );
  } else {
    window.attachEvent("onload", function () {
      document.body.appendChild(element);
    });
  }
};

const getInvisibleIframeElement = function (url) {
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

const addListener = function (fn) {
  if (window.addEventListener) {
    window.addEventListener("message", fn, false);
  } else {
    window.attachEvent("onmessage", fn);
  }
};

const removeListener = function (fn) {
  if (window.removeEventListener) {
    window.removeEventListener("message", fn, false);
  } else {
    window.detachEvent("onmessage", fn);
  }
};

// Main identity getter with Promise
const getAdvertisingIdentity = function () {
  return new Promise((resolve, reject) => {
    const scheme = document.location.protocol === "https:" ? "https:" : "http:";
    const pixelDetailsUrl = `${scheme}//${pixelHost}/${userId}/gr?ev_gb=0&url=${scheme}//www.everestjs.net%2Fstatic%2Fpixel_details.html%23gsurfer%3D__EFGSURFER__`;

    const iframeElement = getInvisibleIframeElement(pixelDetailsUrl);
    addToDom(iframeElement);

    const pixelDetailsReceiver = function (message) {
      if (!message.origin.includes("www.everestjs.net")) {
        console.warn("Ignored message from untrusted origin:", message.origin);
        return;
      }

      console.log("Received message from pixel iframe:", message.data);

      try {
        const pixelRedirectUri = message.data;
        const hashParams = pixelRedirectUri
          .substring(pixelRedirectUri.indexOf("#") + 1)
          .split("&");
        let surferId;

        for (let i = 0; i < hashParams.length; i += 1) {
          const parts = hashParams[i].split("=");
          if (parts[0] === "gsurfer" && parts[1]) {
            surferId = parts[1];
            break;
          }
        }

        removeListener(pixelDetailsReceiver);

        if (surferId) {
          console.log("Extracted surferId:", surferId);
          resolve(surferId);
        } else {
          console.warn("No surferId found in message data");
          resolve(null);
        }
      } catch (err) {
        console.error("Error processing pixel response:", err);
        reject(err);
      }
    };

    addListener(pixelDetailsReceiver);
  });
};

export default getAdvertisingIdentity;

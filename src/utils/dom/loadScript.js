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

import createNode from "./createNode.js";
import appendNode from "./appendNode.js";

let nonce;

/**
 * Returns the nonce if available.
 * @param {Node} [context=document] defaults to document
 * @returns {(String|undefined)} the nonce or undefined if not available
 */
const getNonce = (context = document) => {
  if (nonce === undefined) {
    const n = context.querySelector("[nonce]");
    // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
    //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
    nonce = n && (n.nonce || n.getAttribute("nonce"));
  }
  return nonce;
};

/**
 * Loads an external JavaScript file using Alloy's DOM utilities.
 * Enhanced version that supports additional script attributes.
 * @param {string} url The URL of the script to load.
 * @param {Object} options Additional options for script loading
 * @param {Object} options.attributes Additional attributes to set on script element
 * @param {Function} options.onLoad Optional callback when script loads successfully
 * @param {Function} options.onError Optional callback when script fails to load
 * @returns {Promise<void>} A promise that resolves when the script is loaded or rejects on error.
 */
const loadScript = (url, options = {}) => {
  // Check if script already exists
  if (document.querySelector(`script[src="${url}"]`)) {
    if (options.onLoad) options.onLoad();
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const { attributes = {}, onLoad, onError } = options;

    const script = createNode(
      "script",
      {
        type: "text/javascript",
        src: url,
        async: true,
        ...(getNonce() && { nonce: getNonce() }),
        ...attributes, // Allow additional attributes like crossorigin
      },
      {
        onload: () => {
          if (onLoad) onLoad();
          resolve();
        },
        onerror: () => {
          const error = new Error(`Failed to load script: ${url}`);
          if (onError) onError(error);
          reject(error);
        },
      },
    );

    const appendToDOM = () => {
      const parent = document.head || document.body;
      if (parent) {
        appendNode(parent, script);
      } else {
        const error = new Error(
          "Neither <head> nor <body> available for script insertion.",
        );
        if (onError) onError(error);
        reject(error);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", appendToDOM);
    } else {
      appendToDOM();
    }
  });
};

export default loadScript;

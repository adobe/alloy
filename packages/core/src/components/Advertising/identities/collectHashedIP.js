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

import { SURFER_IP } from "../constants/index.js";
import murmurHash128GuavaHex from "../utils/murmurHash128GuavaHex.js";

let hashedIPAddr = "";

/**
 * Parses the pixel redirect URI (message data from the iframe), extracts clientIp
 * from the hash params, hashes it with MurmurHash32, and updates module state.
 * No browser/third-party-cookie check is applied; call this whenever message data is available.
 * @param {string} pixelRedirectUri - Full redirect URI string (e.g. message.data) containing hash params
 * @returns {string} The hashed IP hex string, or "" if not present
 */
export const extractHashedIPFromMessageData = (pixelRedirectUri) => {
  hashedIPAddr = "";
  if (!pixelRedirectUri || typeof pixelRedirectUri !== "string") {
    return hashedIPAddr;
  }
  const hashIndex = pixelRedirectUri.indexOf("#");
  if (hashIndex === -1) {
    return hashedIPAddr;
  }
  const hashParams = new URLSearchParams(
    pixelRedirectUri.substring(hashIndex + 1),
  );
  const surferIPValue = hashParams.get(SURFER_IP);
  if (surferIPValue) {
    hashedIPAddr = murmurHash128GuavaHex(surferIPValue);
  }
  return hashedIPAddr;
};

/**
 * Returns the current hashed IP address (from last extraction or setHashedIPAddr).
 * @returns {string}
 */
export const getHashedIPAddr = () => hashedIPAddr;

/**
 * Sets the module-level hashed IP (e.g. when loading from cookie).
 * @param {string} value
 */
export const setHashedIPAddr = (value) => {
  hashedIPAddr = value ?? "";
};

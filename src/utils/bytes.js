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

/**
 * Takes a base64 string of bytes and returns a Uint8Array.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export const base64ToBytes = (base64String) => {
  // Add padding if needed
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  // Convert URL-safe base64 to regular base64
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

/**
 * Takes a Uint8Array and returns a base64 string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...bytes));

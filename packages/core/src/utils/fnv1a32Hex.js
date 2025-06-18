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

/* eslint-disable no-bitwise */

/**
 * Generates an FNV1A32 hash for the given input string.
 * @param {string} str - The string to hash
 * @returns {number} - The 32-bit FNV1A hash as a number
 */
const fnv1a32 = (str) => {
  // FNV_offset_basis for 32-bit hash
  let hash = 0x811c9dc5;

  // FNV_prime for 32-bit hash
  const prime = 0x01000193;

  // Convert the string to a properly encoded UTF-8 byte array
  const utf8Encoder = new TextEncoder();
  const bytes = utf8Encoder.encode(str);

  // Process each byte in the UTF-8 encoded array
  for (let i = 0; i < bytes.length; i += 1) {
    // XOR the hash with the byte value, then multiply by prime
    hash ^= bytes[i];
    hash = Math.imul(hash, prime);
  }

  // Return the final hash value (unsigned 32-bit integer)
  return hash >>> 0;
};

/**
 * Generates an FNV1A32 hash and returns it as a hexadecimal string.
 * @param {string} str - The string to hash
 * @returns {string} - The 32-bit FNV1A hash as a hexadecimal string
 */
const fnv1a32Hex = (str) => fnv1a32(str).toString(16).padStart(8, "0");

export default fnv1a32Hex;

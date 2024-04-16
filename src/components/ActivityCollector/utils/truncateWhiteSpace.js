/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Reduces repeated whitespace within a string. Whitespace surrounding the string
 * is trimmed and any occurrence of whitespace within the string is replaced with
 * a single space.
 * @param {string} str String to be formatted.
 * @returns {string} Formatted string.
 */
export default str => {
  return str && str.replace(/\s+/g, " ").trim();
};

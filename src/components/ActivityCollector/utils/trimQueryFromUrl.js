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
 * Trims the query from the URL.
 * @param {string} url
 * @returns {string}
 */
export default (url) => {
  const questionMarkIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  if (
    questionMarkIndex >= 0 &&
    (questionMarkIndex < hashIndex || hashIndex < 0)
  ) {
    return url.substring(0, questionMarkIndex);
  }
  if (hashIndex >= 0) {
    return url.substring(0, hashIndex);
  }
  return url;
};

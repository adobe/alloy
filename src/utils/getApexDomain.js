/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import namespace from "../constants/namespace.js";
import getLastArrayItems from "./getLastArrayItems.js";

const cookieName = `${namespace}getTld`;

/**
 * Of the current web page's hostname, this is the top-most domain that is
 * not a "public suffix" as outlined in https://publicsuffix.org/. In other
 * words, this is top-most domain that is able to accept cookies.
 * @param {Object} window
 * @param {Object} cookieJar
 * @returns {string}
 */
export default (window, cookieJar) => {
  let topLevelCookieDomain = "";

  // If hostParts.length === 1, we may be on localhost.
  const hostParts = window.location.hostname.toLowerCase().split(".");
  let i = 1;

  while (i < hostParts.length && !cookieJar.get(cookieName)) {
    i += 1;
    topLevelCookieDomain = getLastArrayItems(hostParts, i).join(".");
    cookieJar.set(cookieName, cookieName, { domain: topLevelCookieDomain });
  }

  cookieJar.remove(cookieName, { domain: topLevelCookieDomain });

  return topLevelCookieDomain;
};

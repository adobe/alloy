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

import namespace from "../constants/namespace";
import getLastArrayItems from "./getLastArrayItems";

const cookieName = `${namespace}getTld`;

/**
 * Retrieves the top-most domain that is able to accept cookies. This will
 * be the top-most domain that is not a "public suffix" as outlined
 * in https://publicsuffix.org/
 * @param {Object} window
 * @param {Object} cookie
 * @returns {string}
 */
export default function getTopLevelCookieDomain(window, cookie) {
  let topLevelCookieDomain = "";

  // If hostParts.length === 1, we may be on localhost.
  const hostParts = window.location.hostname.toLowerCase().split(".");
  let i = 1;

  while (i < hostParts.length && !cookie.get(cookieName)) {
    i += 1;
    topLevelCookieDomain = getLastArrayItems(hostParts, i).join(".");
    cookie.set(cookieName, cookieName, { domain: topLevelCookieDomain });
  }

  cookie.remove(cookieName, { domain: topLevelCookieDomain });

  return topLevelCookieDomain;
}

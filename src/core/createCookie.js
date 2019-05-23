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
import cookie from "../utils/cookie";
import cookieDetails from "../constants/cookieDetails";
import getTopLevelCookieDomain from "../utils/getTopLevelCookieDomain";

const { ALLOY_COOKIE_NAME, ALLOY_COOKIE_TTL } = cookieDetails;

const createCookie = (prefix, id, cookieDomain = "") => {
  return {
    /**
     * Returns the value from AlloyCookie for a prefix and a key.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    get(name) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      const currentCookie = cookie.get(cookieName);
      const currentCookieParsed = currentCookie && JSON.parse(currentCookie);
      return (
        currentCookieParsed &&
        currentCookieParsed[prefix] &&
        currentCookieParsed[prefix][name]
      );
    },
    /**
     * Updates the value  of a key from AlloyCookie for a prefix
     * @param {...*} arg Strings with key and value to be stored in alloy cookie.
     */
    set(key, value) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      const currentCookie = cookie.get(cookieName)
        ? JSON.parse(cookie.get(cookieName))
        : {};
      const updatedCookie = {
        ...currentCookie,
        [prefix]: { ...currentCookie[prefix], [key]: value }
      };

      cookie.set(cookieName, updatedCookie, {
        expires: ALLOY_COOKIE_TTL,
        domain: cookieDomain || getTopLevelCookieDomain(window, cookie)
      });
    },
    /**
     * Removes a key from alloy cookie.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    remove(key) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      const currentCookie = cookie.get(cookieName);
      const currentCookieParsed = currentCookie && JSON.parse(currentCookie);
      if (currentCookieParsed && currentCookieParsed[prefix]) {
        delete currentCookieParsed[prefix][key];
        cookie.set(cookieName, currentCookieParsed, {
          expires: ALLOY_COOKIE_TTL,
          domain: cookieDomain || getTopLevelCookieDomain(window, cookie)
        });
      }
    }
  };
};

export default createCookie;

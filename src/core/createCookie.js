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
import keys from "../utils/keys";
import cookieDetails from "../constants/cookieDetails";

const { ALLOY_COOKIE_NAME, ALLOY_COOKIE_TTL } = cookieDetails;

const createCookie = prefix => {
  return {
    /**
     * Returns the values from AlloyCookie for Components.
     */
    get: () => {
      const cookieVals = cookie.get(ALLOY_COOKIE_NAME)
        ? JSON.parse(cookie.get(ALLOY_COOKIE_NAME))[prefix]
        : {};
      return cookieVals || {};
    },
    /**
     * Updates and returns values from AlloyCookie for Components
     * @param {...*} arg Object with keys and values to be stored in alloy cookie.
     */
    set: keyVals => {
      const currentCookie = cookie.get(ALLOY_COOKIE_NAME);
      const newCookie = currentCookie ? JSON.parse(currentCookie) : {};

      const newCookiePrefix = newCookie[prefix] ? newCookie[prefix] : {};
      keys(keyVals).forEach(key => {
        newCookiePrefix[key] = keyVals[key];
      });
      const updatedCookie = { ...newCookie, [prefix]: { ...newCookiePrefix } };
      cookie.set(ALLOY_COOKIE_NAME, JSON.stringify(updatedCookie), {
        expires: ALLOY_COOKIE_TTL
      });
      return newCookiePrefix;
    }
  };
};

export default createCookie;

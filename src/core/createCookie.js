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

const { ALLOY_COOKIE_NAME, ALLOY_COOKIE_TTL } = cookieDetails;

const createCookie = (prefix, id, cookieDomain = "") => {
  return {
    /**
     * Returns the value from AlloyCookie for a prefix and a key.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    get(name) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      let currentCookie;
      try {
        currentCookie = cookie.getJSON(cookieName);
        return currentCookie[prefix][name];
      } catch (error) {
        return currentCookie;
      }
    },
    /**
     * Updates and returns values from AlloyCookie for Components
     * @param {...*} arg Strings with key and value to be stored in alloy cookie.
     */
    set(key, value) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      let currentCookie;
      try {
        currentCookie = JSON.parse(cookie.get(cookieName));
      } catch (error) {
        console.log("catch");
        currentCookie = {};
      }
      console.log(2, JSON.stringify(currentCookie));
      const updatedCookie = {
        ...currentCookie,
        [prefix]: { ...currentCookie[prefix], [key]: value }
      };
      console.log(1, JSON.stringify(updatedCookie));
      cookie.set(cookieName, updatedCookie, {
        expires: ALLOY_COOKIE_TTL,
        domain: cookieDomain // TODO use getTopLevelCookieDomain here
      });
    },
    /**
     * Returns the value from AlloyCookie for a prefix and a key.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    remove(name) {
      const cookieName = `${ALLOY_COOKIE_NAME}_${id}`;
      let currentCookie;
      try {
        currentCookie = cookie.getJSON(cookieName);
        delete currentCookie[prefix][name];
        cookie.set(cookieName, currentCookie, {
          expires: ALLOY_COOKIE_TTL,
          domain: cookieDomain // TODO use getTopLevelCookieDomain here
        });
        return true;
      } catch (error) {
        return false;
      }
    }
  };
};

export default createCookie;

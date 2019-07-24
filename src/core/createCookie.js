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

const safeJSONParse = (object, cookieName) => {
  try {
    return JSON.parse(object);
  } catch (error) {
    throw new Error(`Invalid cookie format in ${cookieName} cookie`);
  }
};

/**
 * The purpose of this proxy is to cache the cookie so we don't have to
 * read and deserialize it every time a piece of it is accessed.
 */
const createCookieProxy = (propertyId, cookieDomain = "") => {
  const cookieName = `${ALLOY_COOKIE_NAME}_${propertyId}`;

  let deserializedCookie;
  let cookieHasBeenRead = false;

  return {
    get() {
      // We don't read the cookie right when the cookie proxy is created
      // because we don't know if the user has opted in. If the user
      // hasn't opted in, we're legally obligated to not read the cookie.
      // If a component tries to read something off the cookie though,
      // we assume that the component has received word that the user
      // has opted-in. The responsibility is on the component.
      if (!cookieHasBeenRead) {
        const serializedCookie = cookie.get(cookieName);
        deserializedCookie =
          serializedCookie && safeJSONParse(serializedCookie, cookieName);
        cookieHasBeenRead = true;
      }
      return deserializedCookie;
    },
    set(updatedCookie) {
      deserializedCookie = updatedCookie;
      cookie.set(cookieName, updatedCookie, {
        expires: ALLOY_COOKIE_TTL,
        domain: cookieDomain || getTopLevelCookieDomain(window, cookie)
      });
    }
  };
};

// TODO: Support passing a configurable expiry in the config when creating this cookie.
const createCookie = (componentNamespace, propertyId, cookieDomain = "") => {
  const cookieProxy = createCookieProxy(propertyId, cookieDomain);

  return {
    /**
     * Returns the value from AlloyCookie for a prefix and a key.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    get(name) {
      const currentCookie = cookieProxy.get();
      return (
        currentCookie &&
        currentCookie[componentNamespace] &&
        currentCookie[componentNamespace][name]
      );
    },
    /**
     * Updates the value  of a key from AlloyCookie for a prefix
     * @param {...*} arg Strings with key and value to be stored in alloy cookie.
     */
    set(key, value) {
      const currentCookie = cookieProxy.get() || {};
      // Yes, we're mutating the object returned from the cookie proxy, but
      // it's reasonably controlled since the side effects are all contained
      // within this file.
      currentCookie[componentNamespace] =
        currentCookie[componentNamespace] || {};
      currentCookie[componentNamespace][key] = value;
      cookieProxy.set(currentCookie);
    },
    /**
     * Removes a key from alloy cookie.
     * @param {...*} arg String key stored in alloy cookie under a component prefix.
     */
    remove(key) {
      const currentCookie = cookieProxy.get();
      if (currentCookie && currentCookie[componentNamespace]) {
        // Yes, we're mutating the object returned from the cookie proxy, but
        // it's reasonably controlled since the side effects are all contained
        // within this file.
        delete currentCookie[componentNamespace][key];
        cookieProxy.set(currentCookie);
      }
    }
  };
};

export default createCookie;

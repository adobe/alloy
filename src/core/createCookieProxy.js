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
import getTopLevelCookieDomain from "../utils/getTopLevelCookieDomain";
import memoize from "../utils/memoize";

const memoizedGetTopLevelCookieDomain = memoize(getTopLevelCookieDomain);

const safeJSONParse = (object, cookieName) => {
  try {
    return JSON.parse(object);
  } catch (error) {
    throw new Error(`Invalid cookie format in ${cookieName} cookie`);
  }
};

/**
 * The purpose of this proxy is to cache the cookie so we don't have to
 * read and deserialize it every time a piece of it is accessed. It assumes
 * nothing outside of Alloy will be modifying the cookie.
 */
export default (name, expires, domain = "") => {
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
      if (cookieHasBeenRead) {
        return deserializedCookie;
      }

      const serializedCookie = cookie.get(name);
      deserializedCookie =
        serializedCookie && safeJSONParse(serializedCookie, name);
      cookieHasBeenRead = true;
      return deserializedCookie;
    },
    set(updatedCookie) {
      deserializedCookie = updatedCookie;
      cookie.set(name, updatedCookie, {
        expires,
        domain: domain || memoizedGetTopLevelCookieDomain(window, cookie)
      });
    }
  };
};

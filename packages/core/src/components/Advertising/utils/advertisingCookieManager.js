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

import { getNamespacedCookieName, cookieJar } from "../../../utils/index";
import createLoggingCookieJar from "../../../utils/createLoggingCookieJar";
import {
  ADVERTISING_COOKIE_KEY,
  DEFAULT_COOKIE_EXPIRATION_MINUTES,
  DEFAULT_THROTTLE_MINUTES,
} from "../constants/index";

export default ({ orgId, logger }) => {
  const loggingCookieJar = createLoggingCookieJar({ logger, cookieJar });

  const getCookieName = (key, useNamespace = true) =>
    useNamespace ? getNamespacedCookieName(orgId, key) : key;

  const getDefaultExpiration = (minutes = DEFAULT_THROTTLE_MINUTES) =>
    new Date(Date.now() + minutes * 60 * 1000);

  const safeJsonParse = (value) => {
    try {
      if (value?.startsWith("%7B") || value?.startsWith("{")) {
        return JSON.parse(decodeURIComponent(value));
      }
    } catch {
      // pass
    }
    return value;
  };

  const safeJsonStringify = (value) =>
    typeof value === "object" && value !== null
      ? encodeURIComponent(JSON.stringify(value))
      : value;

  const readCookie = (key, useNamespace = true) => {
    try {
      const name = getCookieName(key, useNamespace);
      const value = loggingCookieJar.get(name);
      return value ? safeJsonParse(value) : null;
    } catch (error) {
      logger.error(`Error reading cookie: ${key}`, error);
      return null;
    }
  };

  const writeCookie = (key, value, options = {}, useNamespace = true) => {
    try {
      const name = getCookieName(key, useNamespace);
      const storedValue = safeJsonStringify(value);
      loggingCookieJar.set(name, storedValue, options);
      return true;
    } catch (error) {
      logger.error(`Error writing cookie: ${key}`, error);
      return false;
    }
  };

  const setValue = (key, value, options = {}) => {
    const existing = readCookie(ADVERTISING_COOKIE_KEY) || {};

    const updated = {
      ...existing,
      [key]: value,
    };

    return writeCookie(ADVERTISING_COOKIE_KEY, updated, {
      expires: getDefaultExpiration(DEFAULT_COOKIE_EXPIRATION_MINUTES),
      ...options,
    });
  };

  const getValue = (key) => {
    const data = readCookie(ADVERTISING_COOKIE_KEY) || {};
    return data[key];
  };

  return {
    setValue,
    getValue,
  };
};

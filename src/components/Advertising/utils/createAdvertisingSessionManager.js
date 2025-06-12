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

import { getNamespacedCookieName } from "../../../utils/index.js";

export default ({ orgId, cookieJar, logger }) => {
  const getCookieName = (key, useNamespace = true) =>
    useNamespace ? getNamespacedCookieName(orgId, key) : key;

  const getDefaultExpiration = (minutes = 30) =>
    new Date(Date.now() + minutes * 60 * 1000);

  const safeJsonParse = (value) => {
    try {
      if (value?.startsWith("%7B") || value?.startsWith("{")) {
        return JSON.parse(decodeURIComponent(value));
      }
    } catch {
      // Silent catch for invalid JSON - return original value
    }
    return value;
  };

  const safeJsonStringify = (value) =>
    typeof value === "object" && value !== null
      ? encodeURIComponent(JSON.stringify(value))
      : value;

  const readCookie = (key, useNamespace = true) => {
    const name = getCookieName(key, useNamespace);
    const value = cookieJar.get(name);
    return value ? safeJsonParse(value) : null;
  };

  const writeCookie = (key, value, options = {}, useNamespace = true) => {
    try {
      const name = getCookieName(key, useNamespace);
      const storedValue = safeJsonStringify(value);
      cookieJar.set(name, storedValue, options);
      return true;
    } catch (error) {
      logger.error(`Error writing cookie: ${key}`, error);
      return false;
    }
  };

  const readAdvertisingIds = () => readCookie("advertising_ids") || {};

  const setValue = (key, value, options = {}) => {
    const existing = readAdvertisingIds();
    const updated = {
      ...existing,
      [key]: value,
      lastUpdated: Date.now(),
    };

    return writeCookie("advertising_ids", updated, {
      expires: getDefaultExpiration(1440),
      ...options,
    });
  };

  const getValue = (key, maxAgeMinutes = 1440) => {
    const data = readAdvertisingIds();
    const age = (Date.now() - (data?.lastUpdated || 0)) / 60000;
    return age > maxAgeMinutes ? undefined : data[key];
  };

  const readClickData = () => readCookie("ev_cc", false) || {};

  const writeClickData = (data, options = {}) =>
    writeCookie(
      "ev_cc",
      { ...data, lastUpdated: Date.now() },
      { expires: getDefaultExpiration(30), ...options },
      false,
    );

  return {
    readAdvertisingIds,
    getValue,
    setValue,
    readClickData,
    writeClickData,
  };
};

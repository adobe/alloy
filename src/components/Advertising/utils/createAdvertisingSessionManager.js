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
// src/components/Advertising/utils/createCookieSessionManager.js
import { getNamespacedCookieName } from "../../../utils/index.js";

export default ({ orgId, cookieJar, logger, namespace = "advertising" }) => {
  /**
   * Gets the full cookie name using the Alloy naming convention
   * @param {string} key - The cookie key
   * @returns {string} Namespaced cookie name
   */
  const getNamespacedName = (key) => {
    return getNamespacedCookieName(orgId, key);
  };

  //----------------------------------------------
  // 1. BASIC COOKIE OPERATIONS
  //----------------------------------------------

  /**
   * Read a cookie
   * @param {string} key - Cookie name
   * @param {boolean} useNamespace - Whether to apply namespace to the key
   * @returns {string|Object|null} Cookie value (parsed if JSON)
   */
  const readCookie = (key, useNamespace = true) => {
    try {
      const cookieName = useNamespace ? getNamespacedName(key) : key;
      const cookieValue = cookieJar.get(cookieName);

      if (!cookieValue) {
        return null;
      }

      // Try to parse as JSON, return raw value if not valid JSON
      try {
        if (cookieValue.startsWith("%7B") || cookieValue.startsWith("{")) {
          return JSON.parse(decodeURIComponent(cookieValue));
        }
      } catch (parseError) {
        logger.info(
          `Cookie ${cookieName} is not valid JSON, returning as raw value , ${parseError}`,
        );
      }

      return cookieValue;
    } catch (error) {
      logger.error(`Error reading cookie: ${key}`, error);
      return null;
    }
  };

  /**
   * Write a cookie
   * @param {string} key - Cookie name
   * @param {string|Object} value - Value to store
   * @param {Object} options - Cookie options
   * @param {boolean} useNamespace - Whether to apply namespace to the key
   * @returns {boolean} Success status
   */
  const writeCookie = (key, value, options = {}, useNamespace = true) => {
    try {
      if (!key) {
        throw new Error("No cookie name provided");
      }

      const cookieName = useNamespace ? getNamespacedName(key) : key;

      // Handle objects by converting to JSON
      const valueToStore =
        typeof value === "object" && value !== null
          ? encodeURIComponent(JSON.stringify(value))
          : value;

      cookieJar.set(cookieName, valueToStore, options);
      logger.info(`Cookie written`, { cookieName });
      return true;
    } catch (error) {
      logger.error(`Error writing cookie: ${key}`, error);
      return false;
    }
  };

  /**
   * Remove a cookie
   * @param {string} key - Cookie name
   * @param {boolean} useNamespace - Whether to apply namespace to the key
   * @returns {boolean} Success status
   */
  const removeCookie = (key, useNamespace = true) => {
    try {
      if (!key) {
        throw new Error("No cookie name provided");
      }

      const cookieName = useNamespace ? getNamespacedName(key) : key;
      cookieJar.remove(cookieName);
      logger.info(`Cookie removed: ${cookieName}`);
      return true;
    } catch (error) {
      logger.error(`Error removing cookie: ${key}`, error);
      return false;
    }
  };

  /**
   * Read session data (shorthand for readCookie with default session key)
   * @param {string} key - The session key (defaults to namespace_session)
   * @returns {Object} Session data
   */
  const readSession = (key = `${namespace}_session`) => {
    const data = readCookie(key, true);
    return data || {};
  };

  /**
   * Store session data with timestamp and merging
   * @param {string|Object} keyOrData - Session key or data object
   * @param {Object} [data] - Data to store (if key provided)
   * @param {Object} [options] - Cookie options
   * @returns {boolean} Success status
   */
  const storeSession = (keyOrData, data, options = {}) => {
    let key;
    let sessionData;

    // Handle overloaded function signature
    if (typeof keyOrData === "object") {
      key = `${namespace}_session`;
      sessionData = keyOrData;
      options = data || {};
    } else {
      key = keyOrData || `${namespace}_session`;
      sessionData = data;
    }

    try {
      // Get existing data to merge with
      const currentData = readSession(key);

      // Create new data with timestamp
      const newData = {
        ...currentData,
        ...sessionData,
        lastUpdated: Date.now(),
      };

      // Default expiration: 30 minutes
      const defaultOptions = {
        expires: new Date(new Date().getTime() + 30 * 60 * 1000),
      };

      return writeCookie(key, newData, { ...defaultOptions, ...options }, true);
    } catch (error) {
      logger.error(`Error storing session: ${key}`, error);
      return false;
    }
  };

  /**
   * Clear a session (removes the cookie)
   * @param {string} key - Session key
   * @returns {boolean} Success status
   */
  const clearSession = (key = `${namespace}_session`) => {
    return removeCookie(key, true);
  };

  /**
   * Check if a session is expired based on lastUpdated timestamp
   * @param {string} key - Session key
   * @param {number} maxAgeMinutes - Maximum age in minutes
   * @returns {boolean} true if expired
   */
  const isSessionExpired = (
    key = `${namespace}_session`,
    maxAgeMinutes = 30,
  ) => {
    const session = readSession(key);

    if (!session || !session.lastUpdated) {
      return true;
    }

    const currentTime = Date.now();
    const expirationTime = session.lastUpdated + maxAgeMinutes * 60 * 1000;
    return currentTime > expirationTime;
  };

  /**
   * Get a specific value from a session
   * @param {string} valueKey - Property name to retrieve
   * @param {string} sessionKey - Session cookie key
   * @param {number} maxAgeMinutes - Max age in minutes for expiration check
   * @returns {*} The value or undefined if expired or not found
   */
  const getValue = (
    valueKey,
    sessionKey = `${namespace}_session`,
    maxAgeMinutes = 30,
  ) => {
    // Check if the session is expired
    if (isSessionExpired(sessionKey, maxAgeMinutes)) {
      logger.info(
        `Session ${sessionKey} is expired, not returning ${valueKey}`,
      );
      return undefined;
    }

    const session = readSession(sessionKey);
    return session[valueKey];
  };

  /**
   * Set a specific value in a session
   * @param {string} valueKey - Property name to set
   * @param {*} value - Value to store
   * @param {string|Object} sessionKeyOrOptions - Session key or options object
   * @param {Object} [options] - Cookie options if sessionKey provided
   * @returns {boolean} Success status
   */
  const setValue = (
    valueKey,
    value,
    sessionKeyOrOptions = `${namespace}_session`,
    options = {},
  ) => {
    let sessionKey;
    let cookieOptions;

    // Handle overloaded signature
    if (typeof sessionKeyOrOptions === "object") {
      sessionKey = `${namespace}_session`;
      cookieOptions = sessionKeyOrOptions;
    } else {
      sessionKey = sessionKeyOrOptions;
      cookieOptions = options;
    }

    // Read current session and update the specific property
    const session = readSession(sessionKey);
    session[valueKey] = value;

    return storeSession(sessionKey, session, cookieOptions);
  };

  /**
   * Check if a specific cookie is expired using the Visitor ID format
   * @param {string} cookieName - The full cookie name
   * @param {string} [idType] - Optional identifier type for multi-value cookies
   * @returns {boolean|string} true if expired, false if not expired
   */
  const checkVisitorCookieExpired = (cookieName, idType) => {
    try {
      if (!cookieName) {
        return true;
      }

      const cookieValue = cookieJar.get(cookieName);

      // If cookie doesn't exist or is empty, it's expired
      if (!cookieValue || cookieValue === "") {
        return true;
      }

      // Handle single-part cookie (no semicolons)
      if (cookieValue.split(";").length === 1) {
        const parts = cookieValue.split(",");

        // Special case: just return first part if no idType specified
        if (idType === undefined) {
          return parts[0];
        }

        // Handle old 3-part cookie format (considered not expired)
        if (parts.length === 3) {
          return false;
        }

        // Check if first character matches idType and has enough parts
        if (cookieValue[0] === idType && parts.length > 3) {
          const timestamp = parseInt(parts[3], 10);
          // Compare the expiry timestamp (part 3) with current time
          if (
            !Number.isNaN(timestamp) &&
            timestamp > Math.floor(Date.now() / 1000)
          ) {
            return false;
          }
        }
      }
      // Handle multi-part cookie (semicolon-separated)
      else {
        const cookieParts = cookieValue.split(";");

        for (let i = 0; i < cookieParts.length; i += 1) {
          const idsPart = cookieParts[i].trim(); // Trim whitespace

          // If this part starts with the requested idType
          if (idsPart[0] === idType) {
            const parts = idsPart.split(",");
            const timestamp = parseInt(parts[3], 10);

            // Check expiry timestamp against current time
            if (
              !Number.isNaN(timestamp) &&
              timestamp > Math.floor(Date.now() / 1000)
            ) {
              return false;
            }
          }
        }
      }

      // If we get here, the cookie is expired
      return true;
    } catch (error) {
      logger.error(
        `Error checking visitor cookie expiration: ${cookieName}`,
        error,
      );
      return true;
    }
  };

  return {
    // Basic cookie operations
    readCookie,
    writeCookie,
    removeCookie,
    getNamespacedName,

    // Session data management
    readSession,
    storeSession,
    clearSession,

    // Value management
    getValue,
    setValue,

    // Expiration checking
    isSessionExpired,
    checkVisitorCookieExpired,
  };
};

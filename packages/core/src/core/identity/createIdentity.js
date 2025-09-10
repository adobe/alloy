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

/** @import { IdentityManager } from './types.js' */
/** @import { Logger } from '../types.js' */
/** @import { CookieJar } from '../../utils/types.js' */

import createDecodeKndctrCookie from "../../utils/createDecodeKndctrCookie";

/**
 * Creates an identity management service for handling ECID (Experience Cloud ID) resolution and tracking.
 *
 * This factory function creates an identity manager service that manages the state of identity resolution,
 * provides methods to check for existing identity cookies, and handles the asynchronous nature
 * of identity acquisition in Adobe Experience Platform Web SDK.
 *
 * @function
 *
 * @param {Object} options
 * @param {Logger} options.logger
 * @param {CookieJar} options.loggingCookieJar
 * @param {{orgId: string}} options.config
 *
 * @returns {IdentityManager}
 *
 * @example
 * // Create an identity service
 * const identityManager = createIdentity({
 *   logger: myLogger,
 *   loggingCookieJar: myCookieJar,
 *   config: { orgId: 'myOrgId@AdobeOrg' }
 * });
 *
 * // Initialize and check for existing identity
 * identityManager.initialize();
 *
 * // Wait for identity to be available
 * await identityManager.awaitIdentity();
 *
 * // Get ECID from cookie
 * const ecid = identityManager.getEcidFromCookie();
 */
export default ({ logger, loggingCookieJar, config }) => {
  let awaitIdentityResolve = null;

  const awaitIdentityPromise = new Promise((resolve) => {
    awaitIdentityResolve = resolve;
  });

  const decodeKndctrCookie = createDecodeKndctrCookie({
    orgId: config.orgId,
    cookieJar: loggingCookieJar,
    logger,
  });

  return {
    initialize() {
      const ecidFromCookie = decodeKndctrCookie();
      if (ecidFromCookie) {
        this.setIdentityAcquired();
      }
    },

    setIdentityAcquired() {
      awaitIdentityResolve();
    },

    awaitIdentity() {
      return awaitIdentityPromise;
    },

    getEcidFromCookie: () => decodeKndctrCookie(),
  };
};

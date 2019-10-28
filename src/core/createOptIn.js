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

import { defer } from "../utils";
import cookieDetails from "../constants/cookieDetails";

// OptIn uses a different cookie than the rest of Alloy.
const { ALLOY_OPT_IN_COOKIE_NAME } = cookieDetails;

// The user has opted into all purposes.
const ALL = "all";

// The user has opted into no purposes.
const NONE = "none";

// The user has yet to provide opt-in purposes.
const PENDING = "pending";

export default ({
  config,
  logger,
  cookieJar,
  createOrgNamespacedCookieName
}) => {
  const deferredsAwaitingResolution = [];
  let purposes = ALL;

  const cookieName = createOrgNamespacedCookieName(
    ALLOY_OPT_IN_COOKIE_NAME,
    config.imsOrgId
  );

  if (config.optInEnabled) {
    purposes = cookieJar.get(cookieName) || PENDING;
  }

  if (purposes === PENDING) {
    logger.warn("Some commands may be delayed until the user opts in.");
  }

  const processDeferreds = () => {
    if (purposes === ALL || purposes === NONE) {
      const optedIn = purposes === ALL;
      while (deferredsAwaitingResolution.length) {
        const deferred = deferredsAwaitingResolution.shift();

        if (optedIn) {
          deferred.resolve();
        } else {
          deferred.reject(new Error("User opted into no purposes."));
        }
      }
    }
  };

  return {
    /**
     * Update the purposes the user has opted into. Only to be called by the
     * Privacy component.
     * @param {string} newPurposes Can be "all" or "none".
     */
    setPurposes(newPurposes) {
      purposes = newPurposes;
      cookieJar.set(cookieName, newPurposes);
      processDeferreds();
    },
    /**
     * Whether the user has opted into all purposes.
     * @returns {boolean}
     */
    // TODO Once we support opting into specific purposes, this
    // method will accept an array of purpose names as an argument and
    // return whether the user has opted into the specified purposes.
    isOptedIn() {
      return purposes === ALL;
    },
    /**
     * Returns a promise that is resolved once the user opts into all purposes.
     * If the user has already opted in, the promise will already be resolved.
     * The user opts into no purposes, the promise will be rejected.
     */
    // TODO Once we support opting into specific purposes, this
    // method will accept an array of purpose names as an argument and
    // will return a promise that will be resolved once the user has opted
    // into the specified purposes.
    whenOptedIn() {
      const deferred = defer();
      deferredsAwaitingResolution.push(deferred);
      processDeferreds();
      return deferred.promise;
    },
    ALL,
    NONE
  };
};

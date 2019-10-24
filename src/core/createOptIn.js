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

const COOKIE_NAMESPACE = "optIn";

// The user has opted into all purposes.
const ALL = "all";

// The user has opted into no purposes.
const NONE = "none";

// The user has yet to provide opt-in purposes.
const PENDING = "pending";

export default () => {
  const deferredsAwaitingResolution = [];
  let cookieJar;
  let purposes = ALL;

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
     * Only to be called by the Privacy component during startup. If opt-in
     * isn't enabled, this method will not be called.
     * @param {Object} logger A logger object.
     * @param {Object} _cookieJar A cookie management object.
     * to the Privacy component.
     */
    enable(logger, _cookieJar) {
      cookieJar = _cookieJar;
      purposes = cookieJar.get(COOKIE_NAMESPACE) || PENDING;

      if (purposes === PENDING) {
        logger.warn("Some commands may be delayed until the user opts in.");
      }
    },
    /**
     * Update the purposes the user has opted into. Only to be called by the
     * Privacy component.
     * @param {string} newPurposes Can be "all" or "none".
     */
    setPurposes(newPurposes) {
      purposes = newPurposes;
      cookieJar.set(COOKIE_NAMESPACE, newPurposes);
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

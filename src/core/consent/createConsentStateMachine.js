/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { defer } from "../../utils";

export const DECLINED_CONSENT = "The user declined consent.";
export const DECLINED_CONSENT_ERROR_CODE = "declinedConsent";

const createDeclinedConsentError = () => {
  const error = new Error(DECLINED_CONSENT);
  error.code = DECLINED_CONSENT_ERROR_CODE;
  return error;
};

export default ({ logger }) => {
  const deferreds = [];

  const runAll = () => {
    while (deferreds.length) {
      deferreds.shift().resolve();
    }
  };
  const discardAll = () => {
    while (deferreds.length) {
      deferreds.shift().reject(createDeclinedConsentError());
    }
  };

  const awaitIn = () => Promise.resolve();
  const awaitOut = () => Promise.reject(createDeclinedConsentError());
  const awaitPending = () => {
    const deferred = defer();
    deferreds.push(deferred);
    return deferred.promise;
  };

  return {
    in() {
      if (this.awaitConsent && this.awaitConsent !== awaitIn) {
        logger.info("User consented.");
      }
      runAll();
      this.awaitConsent = awaitIn;
    },
    out() {
      if (this.awaitConsent === undefined) {
        logger.warn("No user consent. Some commands may fail.");
      } else if (this.awaitConsent !== awaitOut) {
        logger.warn("User declined consent. Some commands may fail.");
      }
      discardAll();
      this.awaitConsent = awaitOut;
    },
    pending() {
      if (!this.awaitConsent) {
        logger.warn("No user consent. Some commands may be delayed.");
      }
      this.awaitConsent = awaitPending;
    },
    awaitConsent: undefined
  };
};

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
export const CONSENT_SOURCE_DEFAULT = "default";
export const CONSENT_SOURCE_INITIAL = "initial";
export const CONSENT_SOURCE_NEW = "new";

const createDeclinedConsentError = errorMessage => {
  const error = Error(errorMessage);
  error.code = DECLINED_CONSENT_ERROR_CODE;
  error.message = errorMessage;
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
      deferreds
        .shift()
        .reject(createDeclinedConsentError("The user declined consent."));
    }
  };

  const awaitInitial = () =>
    Promise.reject(new Error("Consent has not been initialized."));
  const awaitInDefault = () => Promise.resolve();
  const awaitIn = () => Promise.resolve();
  const awaitOutDefault = () =>
    Promise.reject(
      createDeclinedConsentError("No consent preferences have been set.")
    );
  const awaitOut = () =>
    Promise.reject(createDeclinedConsentError("The user declined consent."));
  const awaitPending = () => {
    const deferred = defer();
    deferreds.push(deferred);
    return deferred.promise;
  };

  return {
    in(source) {
      if (source === CONSENT_SOURCE_DEFAULT) {
        this.awaitConsent = awaitInDefault;
      } else {
        if (source === CONSENT_SOURCE_INITIAL) {
          logger.info("Loaded user consent preferences.");
        } else if (
          source === CONSENT_SOURCE_NEW &&
          this.awaitConsent !== awaitIn
        ) {
          logger.info("User consented.");
        }
        runAll();
        this.awaitConsent = awaitIn;
      }
    },
    out(source) {
      if (source === CONSENT_SOURCE_DEFAULT) {
        logger.warn(
          "No saved user consent preferences. Some commands may fail."
        );
        this.awaitConsent = awaitOutDefault;
      } else {
        if (source === CONSENT_SOURCE_INITIAL) {
          logger.warn(
            "Loaded user consent preferences. Some commands may fail."
          );
        } else if (
          source === CONSENT_SOURCE_NEW &&
          this.awaitConsent !== awaitOut
        ) {
          logger.warn("User declined consent. Some commands may fail.");
        }
        discardAll();
        this.awaitConsent = awaitOut;
      }
    },
    pending(source) {
      if (source === CONSENT_SOURCE_DEFAULT) {
        logger.info(
          "No saved user consent preferences. Some commands may be delayed."
        );
      }
      this.awaitConsent = awaitPending;
    },
    awaitConsent: awaitInitial
  };
};

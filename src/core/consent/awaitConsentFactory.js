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

const DECLINED_CONSENT = "The user declined consent.";

export default ({ config, consentState, logger }) => {
  const { consentEnabled } = config;
  const deferreds = [];

  const processConsent = () => {
    if (consentState.isPending()) {
      return;
    }

    // We look for all purposes being true rather than just looking for the
    // "general" purpose being true because it gives us some flexibility in
    // the future. If the edge decides to split the "general" purpose into
    // individual purposes, like "tracking" and "personalization", this code
    // would conservatively consider the user opted out of everything if
    // either "tracking" or "personalization" were set to false. This buys us
    // time to release a new version of Alloy that appropriately behaves
    // according to the more granular purposes and for customers to upgrade.
    const proceed = consentState.hasConsentedToAllPurposes();

    while (deferreds.length) {
      const deferred = deferreds.shift();

      if (proceed) {
        deferred.resolve();
      } else {
        deferred.reject(new Error(DECLINED_CONSENT));
      }
    }
  };

  if (consentEnabled) {
    consentState.onChange(processConsent);

    if (consentState.isPending()) {
      logger.warn("Some commands may be delayed until the user consents.");
    } else if (!consentState.hasConsentedToAllPurposes()) {
      logger.warn(`Some commands may fail. ${DECLINED_CONSENT}`);
    }
    return () => {
      const deferred = defer();
      deferreds.push(deferred);
      processConsent();
      return deferred.promise;
    };
  }

  return () => Promise.resolve();
};

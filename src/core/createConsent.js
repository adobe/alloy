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

import { cookieJar, defer, getNamespacedCookieName, values } from "../utils";
import {
  OPTIN_COOKIE_KEY,
  OPTOUT_COOKIE_KEY
} from "../constants/cookieDetails";
import parseConsentCookie from "./parseConsentCookie";

const getPersistedConsent = cookieName => {
  const cookieValue = cookieJar.get(cookieName);
  if (cookieValue) {
    return parseConsentCookie(cookieValue);
  }
  return undefined;
};

const areAllPurposesTrue = preferencesByPurpose => {
  return (
    preferencesByPurpose && values(preferencesByPurpose).every(value => value)
  );
};

const areAnyPurposesTrue = preferencesByPurpose => {
  return values(preferencesByPurpose).some(value => value);
};

const OPTED_OUT_OF_ALL_PURPOSES = "The user opted out of all purposes.";
const OPTED_INTO_NO_PURPOSES = "The user opted into no purposes.";

const createConsentState = ({
  optInEnabled,
  optInCookieName,
  optOutCookieName,
  onChange
}) => {
  let optInPreferencesByPurpose;
  let optOutPreferencesByPurpose;

  const getStatus = () => {
    // We look for any purpose being true rather than just looking for the
    // "general" purpose being true because it gives us some flexibility in the
    // future. If the edge decides to split the "general" purpose into
    // individual purposes, like "tracking" and "personalization", this code
    // would conservatively consider the user opted out of everything if either
    // "tracking" or "personalization" were set to true. This buys us time
    // to release a new version of Alloy that appropriately behaves according
    // to the more granular purposes and for customers to upgrade. In the
    // case of opt-in, this is also why we look for all purposes being true
    // rather than just the "general" purpose being true.
    if (
      optOutPreferencesByPurpose &&
      areAnyPurposesTrue(optOutPreferencesByPurpose)
    ) {
      return {
        consented: false,
        deniedConsentReason: OPTED_OUT_OF_ALL_PURPOSES
      };
    }

    if (!optInEnabled) {
      return {
        consented: true
      };
    }

    if (optInPreferencesByPurpose) {
      if (areAllPurposesTrue(optInPreferencesByPurpose)) {
        return {
          consented: true
        };
      }

      return {
        consented: false,
        deniedConsentReason: OPTED_INTO_NO_PURPOSES
      };
    }

    return {
      consented: undefined
    };
  };

  const refreshFromCookies = () => {
    optInPreferencesByPurpose = getPersistedConsent(optInCookieName);
    optOutPreferencesByPurpose = getPersistedConsent(optOutCookieName);
  };

  refreshFromCookies();

  return {
    setOptInPreferences(_optInPreferencesByPurpose) {
      optInPreferencesByPurpose = _optInPreferencesByPurpose;
      onChange(getStatus());
    },
    setOptOutPreferences(_optOutPreferencesByPurpose) {
      optOutPreferencesByPurpose = _optOutPreferencesByPurpose;
      onChange(getStatus());
    },
    refreshFromCookies() {
      refreshFromCookies();
      onChange(getStatus());
    },
    getStatus
  };
};

export default ({
  config,
  logger,
  lifecycle,
  createConsentRequestPayload,
  sendEdgeNetworkRequest
}) => {
  const { orgId, optInEnabled } = config;

  const deferredsAwaitingConsent = [];

  const processConsentStatus = consentStatus => {
    if (consentStatus.consented === undefined) {
      return;
    }

    while (deferredsAwaitingConsent.length) {
      const deferred = deferredsAwaitingConsent.shift();

      if (consentStatus.consented) {
        deferred.resolve();
      } else {
        deferred.reject(new Error(consentStatus.deniedConsentReason));
      }
    }
  };

  const consentState = createConsentState({
    optInEnabled,
    optInCookieName: getNamespacedCookieName(orgId, OPTIN_COOKIE_KEY),
    optOutCookieName: getNamespacedCookieName(orgId, OPTOUT_COOKIE_KEY),
    onChange: processConsentStatus
  });

  const initialConsentStatus = consentState.getStatus();

  if (initialConsentStatus.consented === undefined) {
    logger.warn("Some commands may be delayed until the user opts in.");
  } else if (!initialConsentStatus.consented) {
    logger.warn(
      `Some commands may be fail. ${initialConsentStatus.deniedConsentReason}`
    );
  }

  return {
    /**
     * Update the purposes the user has opted into. Only to be called by the
     * Privacy component.
     * @param {Object} preferencesByPurpose An object where the key is
     * the purposes name and the value is a boolean indicating whether the user
     * has opted into the purpose.
     */
    setOptInPurposes(preferencesByPurpose) {
      const status = consentState.getStatus();

      // The edge restricts modifying opt-in preferences if the user is opted
      // out, so we'll prevent the attempt.
      if (
        !status.consented &&
        status.deniedConsentReason === OPTED_OUT_OF_ALL_PURPOSES
      ) {
        return Promise.reject(new Error(OPTED_OUT_OF_ALL_PURPOSES));
      }

      consentState.setOptInPreferences(preferencesByPurpose);

      const payload = createConsentRequestPayload();
      return lifecycle
        .onBeforeConsentRequest({
          payload
        })
        .then(() => {
          payload.setPurposes(preferencesByPurpose);
          return sendEdgeNetworkRequest({
            payload,
            action: "opt-in"
          });
        })
        .then(() => {
          // We optimistically use the preferences the user provided right away,
          // but if the server doesn't agree and sends back a cookie value that
          // conflicts, we adopt whatever the server said since that ultimately
          // is what will be used if the user refreshes the page.
          consentState.refreshFromCookies();
        })
        .catch(error => {
          // Even if there was an error, the consent cookies may
          // have been successfully set.
          consentState.refreshFromCookies();
          throw error;
        });
    },
    /**
     * Update the purposes the user has opted out of. Only to be called by the
     * Privacy component.
     * @param {Object} preferencesByPurpose An object where the key is
     * the purposes name and the value is a boolean indicating whether the user
     * has opted out of the purpose.
     */
    setOptOutPurposes(preferencesByPurpose) {
      consentState.setOptOutPreferences(preferencesByPurpose);

      const payload = createConsentRequestPayload();
      return lifecycle
        .onBeforeConsentRequest({
          payload
        })
        .then(() => {
          payload.setPurposes(preferencesByPurpose);
          return sendEdgeNetworkRequest({
            payload,
            action: "opt-out"
          });
        })
        .then(() => {
          // We optimistically use the preferences the user provided right away,
          // but if the server doesn't agree and sends back a cookie value that
          // conflicts, we adopt whatever the server said since that ultimately
          // is what will be used if the user refreshes the page.
          consentState.refreshFromCookies();
        })
        .catch(error => {
          // Even if there was an error, the consent cookies may
          // have been successfully set.
          consentState.refreshFromCookies();
          throw error;
        });
    },
    /**
     * Returns a promise that is resolved once the user consents to all
     * purposes. If the user has already consented to all purposes, the
     * promise will already be resolved. If the user consents to no purposes,
     * the promise will be rejected.
     */
    // TODO Once we support consenting to specific purposes, this
    // method will accept an array of purpose names as an argument and
    // will return a promise that will be resolved once the user has consented
    // to the specified purposes.
    whenConsented() {
      const deferred = defer();
      deferredsAwaitingConsent.push(deferred);
      processConsentStatus(consentState.getStatus());
      return deferred.promise;
    }
  };
};

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

import { assign } from "../../utils";
import { GENERAL, CONSENT_HASH } from "../../constants/consentPurpose";
import computeConsentHash from "./computeConsentHash";

export default ({
  readStoredConsent,
  taskQueue,
  defaultConsent,
  consent,
  sendSetConsentRequest,
  validateSetConsentOptions
}) => {
  let consentHash;

  const initializeConsent = () => {
    const {
      [CONSENT_HASH]: storedConsentHash,
      ...storedConsentByPurpose
    } = readStoredConsent();
    const consentByPurpose = assign(
      { [GENERAL]: defaultConsent },
      storedConsentByPurpose
    );
    consentHash = storedConsentHash;
    consent.setConsent(consentByPurpose);
  };

  const readCookieIfQueueEmpty = () => {
    const {
      [CONSENT_HASH]: storedConsentHash,
      ...storedConsentByPurpose
    } = readStoredConsent();

    consentHash = storedConsentHash;
    // setting the consent will flush the pending queue of events.
    // we only want to do that if there aren't any pending setConsent calls
    if (taskQueue.length === 0) {
      consent.setConsent(storedConsentByPurpose);
    }
  };

  initializeConsent();

  return {
    commands: {
      setConsent: {
        optionsValidator: validateSetConsentOptions,
        run: ({ consent: consentOptions, identityMap }) => {
          consent.suspend();
          return taskQueue
            .addTask(() => {
              const newConsentHash = computeConsentHash(consentOptions);
              if (consentHash === undefined || consentHash !== newConsentHash) {
                return sendSetConsentRequest({
                  consentOptions,
                  identityMap,
                  newConsentHash
                });
              }
              return Promise.resolve();
            })
            .catch(error => {
              readCookieIfQueueEmpty();
              throw error;
            })
            .then(readCookieIfQueueEmpty);
        }
      }
    },
    lifecycle: {
      // Read the cookie here too because the consent cookie may change on any request
      onResponse: readCookieIfQueueEmpty,
      // Even when we get a failure HTTP status code, the consent cookie can
      // still get updated. This could happen, for example, if the user is
      // opted out in AudienceManager, but no consent cookie exists on the
      // client. The request will be sent and the server will respond with a
      // 403 Forbidden and a consent cookie.
      onRequestFailure: readCookieIfQueueEmpty
    }
  };
};

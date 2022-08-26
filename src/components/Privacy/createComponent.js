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

import { GENERAL } from "../../constants/consentPurpose";

export default ({
  storedConsent,
  taskQueue,
  defaultConsent,
  consent,
  sendSetConsentRequest,
  validateSetConsentOptions,
  consentHashStore,
  doesIdentityCookieExist
}) => {
  const defaultConsentByPurpose = { [GENERAL]: defaultConsent };
  let storedConsentByPurpose = storedConsent.read();

  const identityCookieExists = doesIdentityCookieExist();
  const consentCookieExists = storedConsentByPurpose[GENERAL] !== undefined;
  if (!identityCookieExists || !consentCookieExists) {
    consentHashStore.clear();
  }
  // If the identity cookie is gone, remove the consent cookie because the
  // consent info is tied to the identity.
  if (!identityCookieExists) {
    storedConsent.clear();
    storedConsentByPurpose = {};
  }

  consent.initializeConsent(defaultConsentByPurpose, storedConsentByPurpose);

  const readCookieIfQueueEmpty = () => {
    if (taskQueue.length === 0) {
      const storedConsentObject = storedConsent.read();
      // Only read cookies when there are no outstanding setConsent
      // requests. This helps with race conditions.
      if (storedConsentObject[GENERAL] !== undefined) {
        consent.setConsent(storedConsentObject);
      }
    }
  };

  return {
    commands: {
      setConsent: {
        optionsValidator: validateSetConsentOptions,
        run: ({ consent: consentOptions, identityMap, configuration }) => {
          consent.suspend();
          const consentHashes = consentHashStore.lookup(consentOptions);
          return taskQueue
            .addTask(() => {
              if (consentHashes.isNew()) {
                const consentRequestOptions = {
                  consentOptions,
                  identityMap
                };
                if (configuration) {
                  consentRequestOptions.configuration = configuration;
                }
                return sendSetConsentRequest(consentRequestOptions);
              }
              return Promise.resolve();
            })
            .then(() => consentHashes.save())
            .finally(readCookieIfQueueEmpty);
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

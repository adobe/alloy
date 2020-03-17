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

import { assign, finallyHelper } from "../../utils";

export default ({
  readStoredConsent,
  taskQueue,
  defaultConsent,
  consent,
  sendSetConsentRequest,
  validateSetConsentOptions
}) => {
  const consentByPurpose = assign({}, defaultConsent, readStoredConsent());
  consent.setConsent(consentByPurpose);

  const readCookieIfQueueEmpty = () => {
    if (taskQueue.length === 0) {
      // Only read cookies when there are no outstanding setConsent
      // requests. This helps with race conditions.
      consent.setConsent(readStoredConsent());
    }
  };

  return {
    commands: {
      setConsent(options) {
        const validatedOptions = validateSetConsentOptions(options);
        consent.suspend();
        return taskQueue.addTask(() =>
          finallyHelper(
            sendSetConsentRequest(validatedOptions),
            readCookieIfQueueEmpty
          )
        );
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
      onResponseFailure: readCookieIfQueueEmpty
    }
  };
};

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

import { objectOf, enumOf } from "../../utils/validation";
import { IN, OUT } from "../../constants/consentStatus";
import { GENERAL } from "../../constants/consentPurpose";

const CONSENT_HANDLE = "privacy:consent";

const validateSetConsentOptions = objectOf({
  [GENERAL]: enumOf(IN, OUT).required()
})
  .noUnknownFields()
  .required();

const createPrivacy = ({ consent }) => {
  return {
    commands: {
      setConsent(options) {
        return consent.setConsent(validateSetConsentOptions(options));
      }
    },
    lifecycle: {
      onResponse({ response }) {
        // Notify consent that a request was complete because the consent
        // cookie may have changed.
        consent.requestComplete();
        // TODO: Rather that looking for the privacy:consent payload on
        // the response, we should instead get rid of the lifecycle.onResponse
        // lifecycle method and be able to register a response handler from
        // inside lifecycle.onBeforeConsentRequest
        // Relevant issue:
        // https://jira.corp.adobe.com/browse/CORE-40512
        if (response.getPayloadsByType(CONSENT_HANDLE).length) {
          consent.consentRequestComplete();
        }
      },
      onRequestFailure() {
        // Even when we get a failure HTTP status code, the consent cookie can
        // still get updated. This could happen, for example, if the user is
        // opted out in AudienceManager, but no consent cookie exists on the
        // client. The request will be sent and the server will respond with a
        // 403 Forbidden and a consent cookie.
        // TODO: We can't determine if onRequestFailure was called due to a
        // setConsent call failure, because we can't look to see if the response
        // includes a consent handle like we did in lifecycle.onResponse.
        // Relevant issues:
        // https://jira.corp.adobe.com/browse/CORE-40512
        // https://jira.corp.adobe.com/browse/CORE-40772
        consent.requestComplete();
      }
    }
  };
};

createPrivacy.namespace = "Privacy";

export default createPrivacy;

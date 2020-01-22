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

import { boolean } from "../../utils/validation";
import { isString } from "../../utils";

const ALL = "all";
const NONE = "none";

const throwInvalidPurposesError = purposes => {
  throw new Error(
    `Consent purposes must be "all" or "none". Received: ${purposes}`
  );
};

const createPrivacy = ({ config, consent }) => {
  return {
    commands: {
      setConsent({ purposes }) {
        if (!config.consentEnabled) {
          throw new Error(
            "consentEnabled must be set to true before using the setConsent command."
          );
        }

        if (!isString(purposes)) {
          throwInvalidPurposesError(purposes);
        }

        const lowerCasePurposes = purposes.toLowerCase();

        if (lowerCasePurposes !== ALL && lowerCasePurposes !== NONE) {
          throwInvalidPurposesError(purposes);
        }

        return consent.setConsent({
          general: lowerCasePurposes === ALL ? "in" : "out"
        });
      }
    },
    lifecycle: {
      onResponse({ response }) {
        consent.requestComplete();
        // TODO: Rather that looking for the privacy:consent payload on
        // the response, we should instead get rid of the lifecycle.onResponse
        // lifecycle method and be able to register a response handler from
        // inside lifecycle.onBeforeConsentRequest
        // Also, what should we do if the consent request fails?
        if (response.getPayloadsByType("privacy:consent").length) {
          consent.consentRequestComplete();
        }
      }
    }
  };
};

createPrivacy.namespace = "Privacy";

createPrivacy.configValidators = {
  consentEnabled: boolean().default(false)
};

export default createPrivacy;

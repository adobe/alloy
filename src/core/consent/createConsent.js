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

import { DECLINED_CONSENT } from "./createConsentStateMachine";
import { IN, OUT, PENDING } from "../../constants/consentStatus";
import { GENERAL, CONSENT_HASH } from "../../constants/consentPurpose";

export default ({ generalConsentState, logger }) => {
  return {
    setConsent({ [GENERAL]: generalConsent, [CONSENT_HASH]: consentHash }) {
      switch (generalConsent) {
        case IN:
          generalConsentState.in(consentHash);
          break;
        case OUT:
        case PENDING:
          logger.warn(`Some commands may fail. ${DECLINED_CONSENT}`);
          generalConsentState.out(consentHash);
          break;
        default:
          logger.warn(`Unknown consent value: ${generalConsent}`);
          break;
      }
    },
    suspend() {
      generalConsentState.suspend();
    },
    awaitConsent(event) {
      return generalConsentState.awaitConsent(event);
    }
  };
};

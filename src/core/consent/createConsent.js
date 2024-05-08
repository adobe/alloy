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

import { IN, OUT, PENDING } from "../../constants/consentStatus.js";
import { GENERAL } from "../../constants/consentPurpose.js";
import {
  CONSENT_SOURCE_DEFAULT,
  CONSENT_SOURCE_INITIAL,
  CONSENT_SOURCE_NEW
} from "./createConsentStateMachine";

export default ({ generalConsentState, logger }) => {
  const setConsent = (consentByPurpose, source) => {
    switch (consentByPurpose[GENERAL]) {
      case IN:
        generalConsentState.in(source);
        break;
      case OUT:
        generalConsentState.out(source);
        break;
      case PENDING:
        generalConsentState.pending(source);
        break;
      default:
        logger.warn(`Unknown consent value: ${consentByPurpose[GENERAL]}`);
        break;
    }
  };
  return {
    initializeConsent(defaultConsentByPurpose, storedConsentByPurpose) {
      if (storedConsentByPurpose[GENERAL]) {
        setConsent(storedConsentByPurpose, CONSENT_SOURCE_INITIAL);
      } else {
        setConsent(defaultConsentByPurpose, CONSENT_SOURCE_DEFAULT);
      }
    },
    setConsent(consentByPurpose) {
      setConsent(consentByPurpose, CONSENT_SOURCE_NEW);
    },
    suspend() {
      generalConsentState.pending();
    },
    awaitConsent() {
      return generalConsentState.awaitConsent();
    },
    withConsent() {
      return generalConsentState.withConsent();
    },
    current() {
      return generalConsentState.current();
    }
  };
};

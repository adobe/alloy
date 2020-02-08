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
import { cookieJar, getNamespacedCookieName, values } from "../../utils";
import parseConsentCookie from "./parseConsentCookie";
import { CONSENT_COOKIE_KEY } from "../../constants/cookieDetails";
import { IN, PENDING } from "../../constants/consentStatus";
import * as consentPurposeEnum from "../../constants/consentPurpose";

const GENERAL = consentPurposeEnum.GENERAL;
const consentPurposes = values(consentPurposeEnum);

const getPersistedConsent = cookieName => {
  const cookieValue = cookieJar.get(cookieName);
  return cookieValue ? parseConsentCookie(cookieValue) : {};
};

export default ({ config }) => {
  const { orgId, defaultConsent } = config;
  const consentCookieName = getNamespacedCookieName(orgId, CONSENT_COOKIE_KEY);
  const onChangeHandlers = [];
  let consentByPurpose;
  let suspended = false;

  const notifyOnChangeHandlers = () => {
    onChangeHandlers.forEach(onChangeHandler => {
      onChangeHandler();
    });
  };

  const updateFromCookies = () => {
    if (!suspended) {
      const persistedConsentByPurpose = getPersistedConsent(consentCookieName);
      consentByPurpose = consentPurposes.reduce((memo, purpose) => {
        memo[purpose] = persistedConsentByPurpose[purpose] || defaultConsent;
        return memo;
      }, {});
      notifyOnChangeHandlers();
    }
  };

  const setToPending = () => {
    consentByPurpose = consentPurposes.reduce((memo, purpose) => {
      memo[purpose] = PENDING;
      return memo;
    }, {});
    notifyOnChangeHandlers();
  };

  updateFromCookies();

  return {
    suspend() {
      if (!suspended) {
        suspended = true;
        setToPending();
      }
    },
    unsuspend() {
      if (suspended) {
        suspended = false;
        updateFromCookies();
      }
    },
    updateFromCookies,
    // TODO Once we support consenting to specific purposes, this
    // method will accept an array of purpose names as an argument and
    // will return whether the user has consented into those purposes.
    isPending() {
      return consentByPurpose[GENERAL] === PENDING;
    },
    // TODO Once we support consenting to specific purposes, this
    // method will accept an array of purpose names as an argument and
    // will return whether the user has consented into those purposes.
    hasConsentedToAllPurposes() {
      return consentByPurpose[GENERAL] === IN;
    },
    onChange(onChangeHandler) {
      onChangeHandlers.push(onChangeHandler);
    }
  };
};

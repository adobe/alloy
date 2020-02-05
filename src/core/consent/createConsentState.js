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
import { IN } from "../../constants/consentStatus";

const getPersistedConsent = cookieName => {
  const cookieValue = cookieJar.get(cookieName);
  if (cookieValue) {
    return parseConsentCookie(cookieValue);
  }
  return undefined;
};

export default ({ config }) => {
  const { orgId } = config;
  const consentCookieName = getNamespacedCookieName(orgId, CONSENT_COOKIE_KEY);
  const onChangeHandlers = [];
  let consentByPurpose;
  let suspended = false;

  const setConsentByPurpose = _consentByPurpose => {
    consentByPurpose = _consentByPurpose;
    onChangeHandlers.forEach(onChangeHandler => {
      onChangeHandler();
    });
  };
  const updateFromCookies = () => {
    if (!suspended) {
      setConsentByPurpose(getPersistedConsent(consentCookieName));
    }
  };

  updateFromCookies();

  return {
    suspend() {
      if (!suspended) {
        suspended = true;
        setConsentByPurpose(undefined);
      }
    },
    unsuspend() {
      if (suspended) {
        suspended = false;
        updateFromCookies();
      }
    },
    updateFromCookies,
    isPending() {
      return consentByPurpose === undefined;
    },
    // TODO Once we support consenting to specific purposes, this
    // method will accept an array of purpose names as an argument and
    // will return whether the user has consented into those purposes.
    hasConsentedToAllPurposes() {
      return (
        Boolean(consentByPurpose) &&
        values(consentByPurpose).every(value => value === IN)
      );
    },
    onChange(onChangeHandler) {
      onChangeHandlers.push(onChangeHandler);
    }
  };
};

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

import {
  createTaskQueue,
  cookieJar,
  injectDoesIdentityCookieExist,
  sanitizeOrgIdForCookieName
} from "../../utils";
import createComponent from "./createComponent";
import createConsentHashStore from "./createConsentHashStore";
import createConsentRequestPayload from "./createConsentRequestPayload";
import createConsentRequest from "./createConsentRequest";
import createStoredConsent from "./createStoredConsent";
import injectSendSetConsentRequest from "./injectSendSetConsentRequest";
import parseConsentCookie from "./parseConsentCookie";
import validateSetConsentOptions from "./validateSetConsentOptions";

const createPrivacy = ({
  config,
  consent,
  sendEdgeNetworkRequest,
  createNamespacedStorage
}) => {
  const { orgId, defaultConsent } = config;
  const storedConsent = createStoredConsent({
    parseConsentCookie,
    orgId,
    cookieJar
  });
  const taskQueue = createTaskQueue();
  const sendSetConsentRequest = injectSendSetConsentRequest({
    createConsentRequestPayload,
    createConsentRequest,
    sendEdgeNetworkRequest
  });
  const storage = createNamespacedStorage(
    `${sanitizeOrgIdForCookieName(orgId)}.consentHashes.`
  );
  const consentHashStore = createConsentHashStore({
    storage: storage.persistent
  });

  const doesIdentityCookieExist = injectDoesIdentityCookieExist({ orgId });

  return createComponent({
    storedConsent,
    taskQueue,
    defaultConsent,
    consent,
    sendSetConsentRequest,
    validateSetConsentOptions,
    consentHashStore,
    doesIdentityCookieExist
  });
};

createPrivacy.namespace = "Privacy";

export default createPrivacy;

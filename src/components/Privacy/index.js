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

import { createTaskQueue, cookieJar } from "../../utils";
import createComponent from "./createComponent";
import createConsentRequestPayload from "./createConsentRequestPayload";
import readStoredConsentFactory from "./readStoredConsentFactory";
import sendSetConsentRequestFactory from "./sendSetConsentRequestFactory";
import parseConsentCookie from "./parseConsentCookie";
import validateSetConsentOptions from "./validateSetConsentOptions";

const createPrivacy = ({
  config,
  consent,
  sendEdgeNetworkRequest,
  lifecycle
}) => {
  const { orgId, defaultConsent } = config;
  const readStoredConsent = readStoredConsentFactory({
    parseConsentCookie,
    orgId,
    cookieJar
  });
  const taskQueue = createTaskQueue();
  const sendSetConsentRequest = sendSetConsentRequestFactory({
    lifecycle,
    createConsentRequestPayload,
    sendEdgeNetworkRequest
  });

  return createComponent({
    readStoredConsent,
    taskQueue,
    defaultConsent,
    consent,
    sendSetConsentRequest,
    validateSetConsentOptions
  });
};

createPrivacy.namespace = "Privacy";

export default createPrivacy;

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
  fireReferrerHideableImage,
  areThirdPartyCookiesSupportedByDefault,
  convertStringToSha256Buffer
} from "../../utils";
import injectProcessIdSyncs from "./injectProcessIdSyncs";
import configValidators from "./configValidators";

import createComponent from "./createComponent";
import createLegacyIdentity from "./createLegacyIdentity";
import awaitVisitorOptIn from "./visitorService/awaitVisitorOptIn";
import injectGetEcidFromVisitor from "./visitorService/injectGetEcidFromVisitor";
import injectHandleResponseForIdSyncs from "./injectHandleResponseForIdSyncs";
import injectEnsureRequestHasIdentity from "./injectEnsureRequestHasIdentity";
import createIdentityManager from "./identities/createIdentityManager";
import addEcidQueryToEvent from "./addEcidQueryToEvent";
import injectDoesIdentityCookieExist from "./injectDoesIdentityCookieExist";
import injectSetDomainForInitialIdentityPayload from "./injectSetDomainForInitialIdentityPayload";
import injectAddLegacyEcidToPayload from "./injectAddLegacyEcidToPayload";
import addEcidToPayload from "./addEcidToPayload";
import injectAwaitIdentityCookie from "./injectAwaitIdentityCookie";
import getEcidFromResponse from "./getEcidFromResponse";
import createGetIdentity from "./getIdentity/createGetIdentity";
import createIdentityPayload from "./getIdentity/createIdentityPayload";

const createIdentity = ({
  config,
  logger,
  consent,
  eventManager,
  sendEdgeNetworkRequest
}) => {
  const { orgId, thirdPartyCookiesEnabled } = config;
  const identityManager = createIdentityManager({
    eventManager,
    consent,
    logger,
    convertStringToSha256Buffer
  });
  const getEcidFromVisitor = injectGetEcidFromVisitor({
    logger,
    orgId,
    awaitVisitorOptIn
  });
  const legacyIdentity = createLegacyIdentity({
    config,
    getEcidFromVisitor
  });
  const doesIdentityCookieExist = injectDoesIdentityCookieExist({ orgId });
  const getIdentity = createGetIdentity({
    sendEdgeNetworkRequest,
    createIdentityPayload
  });
  const setDomainForInitialIdentityPayload = injectSetDomainForInitialIdentityPayload(
    {
      thirdPartyCookiesEnabled,
      areThirdPartyCookiesSupportedByDefault
    }
  );
  const addLegacyEcidToPayload = injectAddLegacyEcidToPayload({
    getLegacyEcid: legacyIdentity.getEcid,
    addEcidToPayload
  });
  const awaitIdentityCookie = injectAwaitIdentityCookie({
    orgId,
    doesIdentityCookieExist
  });
  const ensureRequestHasIdentity = injectEnsureRequestHasIdentity({
    doesIdentityCookieExist,
    setDomainForInitialIdentityPayload,
    addLegacyEcidToPayload,
    awaitIdentityCookie,
    logger
  });
  const processIdSyncs = injectProcessIdSyncs({
    fireReferrerHideableImage,
    logger
  });
  const handleResponseForIdSyncs = injectHandleResponseForIdSyncs({
    processIdSyncs
  });
  return createComponent({
    addEcidQueryToEvent,
    identityManager,
    ensureRequestHasIdentity,
    setLegacyEcid: legacyIdentity.setEcid,
    handleResponseForIdSyncs,
    getEcidFromResponse,
    getIdentity,
    consent
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

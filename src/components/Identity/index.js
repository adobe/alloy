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
  areThirdPartyCookiesSupportedByDefault,
  injectDoesIdentityCookieExist
} from "../../utils";
import injectProcessIdSyncs from "./injectProcessIdSyncs";
import configValidators from "./configValidators";

import createComponent from "./createComponent";
import createLegacyIdentity from "./createLegacyIdentity";
import awaitVisitorOptIn from "./visitorService/awaitVisitorOptIn";
import injectGetEcidFromVisitor from "./visitorService/injectGetEcidFromVisitor";
import injectHandleResponseForIdSyncs from "./injectHandleResponseForIdSyncs";
import injectEnsureSingleIdentity from "./injectEnsureSingleIdentity";
import addEcidQueryToPayload from "./addEcidQueryToPayload";
import injectSetDomainForInitialIdentityPayload from "./injectSetDomainForInitialIdentityPayload";
import injectAddLegacyEcidToPayload from "./injectAddLegacyEcidToPayload";
import injectAddQueryStringIdentityToPayload from "./injectAddQueryStringIdentityToPayload";
import addEcidToPayload from "./addEcidToPayload";
import injectAwaitIdentityCookie from "./injectAwaitIdentityCookie";
import getEcidFromResponse from "./getEcidFromResponse";
import createGetIdentity from "./getIdentity/createGetIdentity";
import createIdentityRequest from "./getIdentity/createIdentityRequest";
import createIdentityRequestPayload from "./getIdentity/createIdentityRequestPayload";
import injectAppendIdentityToUrl from "./appendIdentityToUrl/injectAppendIdentityToUrl";

const createIdentity = ({
  config,
  logger,
  consent,
  fireReferrerHideableImage,
  sendEdgeNetworkRequest
}) => {
  const { orgId, thirdPartyCookiesEnabled, idOverwriteEnabled } = config;

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
    createIdentityRequestPayload,
    createIdentityRequest
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
  const addQueryStringIdentityToPayload = injectAddQueryStringIdentityToPayload(
    {
      locationSearch: window.document.location.search,
      dateProvider: () => new Date(),
      orgId,
      logger,
      idOverwriteEnabled
    }
  );
  const awaitIdentityCookie = injectAwaitIdentityCookie({
    doesIdentityCookieExist,
    orgId
  });
  const ensureSingleIdentity = injectEnsureSingleIdentity({
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
  const appendIdentityToUrl = injectAppendIdentityToUrl({
    dateProvider: () => new Date(),
    orgId
  });
  return createComponent({
    addEcidQueryToPayload,
    addQueryStringIdentityToPayload,
    ensureSingleIdentity,
    setLegacyEcid: legacyIdentity.setEcid,
    handleResponseForIdSyncs,
    getEcidFromResponse,
    getIdentity,
    consent,
    appendIdentityToUrl,
    logger
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

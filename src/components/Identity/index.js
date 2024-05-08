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
  injectDoesIdentityCookieExist,
  createLoggingCookieJar,
  cookieJar
} from "../../utils";
import injectProcessIdSyncs from "./injectProcessIdSyncs.js";
import configValidators from "./configValidators.js";

import createComponent from "./createComponent.js";
import createLegacyIdentity from "./createLegacyIdentity.js";
import awaitVisitorOptIn from "./visitorService/awaitVisitorOptIn.js";
import injectGetEcidFromVisitor from "./visitorService/injectGetEcidFromVisitor.js";
import injectHandleResponseForIdSyncs from "./injectHandleResponseForIdSyncs.js";
import injectEnsureSingleIdentity from "./injectEnsureSingleIdentity.js";
import addEcidQueryToPayload from "./addEcidQueryToPayload.js";
import injectSetDomainForInitialIdentityPayload from "./injectSetDomainForInitialIdentityPayload.js";
import injectAddLegacyEcidToPayload from "./injectAddLegacyEcidToPayload.js";
import injectAddQueryStringIdentityToPayload from "./injectAddQueryStringIdentityToPayload.js";
import addEcidToPayload from "./addEcidToPayload.js";
import injectAwaitIdentityCookie from "./injectAwaitIdentityCookie.js";
import getEcidFromResponse from "./getEcidFromResponse.js";
import createGetIdentity from "./getIdentity/createGetIdentity.js";
import createIdentityRequest from "./getIdentity/createIdentityRequest.js";
import createIdentityRequestPayload from "./getIdentity/createIdentityRequestPayload.js";
import injectAppendIdentityToUrl from "./appendIdentityToUrl/injectAppendIdentityToUrl.js";

const createIdentity = ({
  config,
  logger,
  consent,
  fireReferrerHideableImage,
  sendEdgeNetworkRequest,
  apexDomain
}) => {
  const {
    orgId,
    thirdPartyCookiesEnabled,
    edgeConfigOverrides: globalConfigOverrides
  } = config;

  const getEcidFromVisitor = injectGetEcidFromVisitor({
    logger,
    orgId,
    awaitVisitorOptIn
  });
  const loggingCookieJar = createLoggingCookieJar({ logger, cookieJar });
  const legacyIdentity = createLegacyIdentity({
    config,
    getEcidFromVisitor,
    apexDomain,
    cookieJar: loggingCookieJar,
    isPageSsl: window.location.protocol === "https:"
  });
  const doesIdentityCookieExist = injectDoesIdentityCookieExist({ orgId });
  const getIdentity = createGetIdentity({
    sendEdgeNetworkRequest,
    createIdentityRequestPayload,
    createIdentityRequest,
    globalConfigOverrides
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
      logger
    }
  );
  const awaitIdentityCookie = injectAwaitIdentityCookie({
    doesIdentityCookieExist,
    orgId,
    logger
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
    orgId,
    globalConfigOverrides
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
    logger,
    config
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

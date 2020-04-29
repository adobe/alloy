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
import processIdSyncsFactory from "./processIdSyncsFactory";
import configValidators from "./configValidators";

import createComponent from "./createComponent";
import createLegacyIdentity from "./createLegacyIdentity";
import awaitVisitorOptIn from "./visitorService/awaitVisitorOptIn";
import getEcidFromVisitorFactory from "./visitorService/getEcidFromVisitorFactory";
import handleResponseForIdSyncsFactory from "./handleResponseForIdSyncsFactory";
import ensureRequestHasIdentityFactory from "./ensureRequestHasIdentityFactory";
import createIdentityManager from "./identities/createIdentityManager";
import addEcidQueryToEvent from "./addEcidQueryToEvent";
import doesIdentityCookieExistFactory from "./doesIdentityCookieExistFactory";
import setDomainForInitialIdentityPayloadFactory from "./setDomainForInitialIdentityPayloadFactory";
import addLegacyEcidToPayloadFactory from "./addLegacyEcidToPayloadFactory";
import addEcidToPayload from "./addEcidToPayload";
import awaitIdentityCookieFactory from "./awaitIdentityCookieFactory";
import getEcidFromResponse from "./getEcidFromResponse";
import createGetEcid from "./getEcid/createGetEcid";
import validateSyncIdentityOptions from "./validateSyncIdentityOptions";

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
  const getEcidFromVisitor = getEcidFromVisitorFactory({
    logger,
    orgId,
    awaitVisitorOptIn
  });
  const legacyIdentity = createLegacyIdentity({
    config,
    getEcidFromVisitor
  });
  const doesIdentityCookieExist = doesIdentityCookieExistFactory({ orgId });
  const getEcid = createGetEcid({ sendEdgeNetworkRequest, consent });
  const setDomainForInitialIdentityPayload = setDomainForInitialIdentityPayloadFactory(
    {
      thirdPartyCookiesEnabled,
      areThirdPartyCookiesSupportedByDefault
    }
  );
  const addLegacyEcidToPayload = addLegacyEcidToPayloadFactory({
    getLegacyEcid: legacyIdentity.getEcid,
    addEcidToPayload
  });
  const awaitIdentityCookie = awaitIdentityCookieFactory({
    orgId,
    doesIdentityCookieExist
  });
  const ensureRequestHasIdentity = ensureRequestHasIdentityFactory({
    doesIdentityCookieExist,
    setDomainForInitialIdentityPayload,
    addLegacyEcidToPayload,
    awaitIdentityCookie,
    logger
  });
  const processIdSyncs = processIdSyncsFactory({
    fireReferrerHideableImage,
    logger
  });
  const handleResponseForIdSyncs = handleResponseForIdSyncsFactory({
    processIdSyncs
  });
  return createComponent({
    addEcidQueryToEvent,
    identityManager,
    ensureRequestHasIdentity,
    setLegacyEcid: legacyIdentity.setEcid,
    handleResponseForIdSyncs,
    getEcidFromResponse,
    getEcid,
    consent,
    validateSyncIdentityOptions
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

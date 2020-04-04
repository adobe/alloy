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
  areThirdPartyCookiesSupportedByDefault
} from "../../utils";
import processIdSyncsFactory from "./processIdSyncsFactory";
import configValidators from "./configValidators";

import createComponent from "./createComponent";
import createMigration from "./createMigration";
import handleResponseForIdSyncsFactory from "./handleResponseForIdSyncsFactory";
import ensureRequestHasIdentityFactory from "./ensureRequestHasIdentityFactory";
import createCustomerIds from "./customerIds/createCustomerIds";
import addEcidQueryToEvent from "./addEcidQueryToEvent";
import doesIdentityCookieExistFactory from "./doesIdentityCookieExistFactory";
import setDomainForInitialIdentityPayloadFactory from "./setDomainForInitialIdentityPayloadFactory";
import addEcidFromLegacyToPayloadFactory from "./addEcidFromLegacyToPayloadFactory";
import addEcidToPayload from "./addEcidToPayload";
import awaitIdentityCookieFactory from "./awaitIdentityCookieFactory";
import getEcidFromResponse from "./getEcidFromResponse";

const createIdentity = ({ config, logger, consent, eventManager }) => {
  const { orgId, idMigrationEnabled, thirdPartyCookiesEnabled } = config;
  const customerIds = createCustomerIds({ eventManager, consent, logger });
  const migration = createMigration({ idMigrationEnabled, orgId, logger });
  const doesIdentityCookieExist = doesIdentityCookieExistFactory({ orgId });
  const setDomainForInitialIdentityPayload = setDomainForInitialIdentityPayloadFactory(
    {
      thirdPartyCookiesEnabled,
      areThirdPartyCookiesSupportedByDefault
    }
  );
  const addEcidFromLegacyToPayload = addEcidFromLegacyToPayloadFactory({
    getEcidFromLegacy: migration.getEcidFromLegacy,
    addEcidToPayload
  });
  const awaitIdentityCookie = awaitIdentityCookieFactory({
    orgId,
    doesIdentityCookieExist
  });
  const ensureRequestHasIdentity = ensureRequestHasIdentityFactory({
    doesIdentityCookieExist,
    setDomainForInitialIdentityPayload,
    addEcidFromLegacyToPayload,
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
    customerIds,
    ensureRequestHasIdentity,
    createLegacyIdentityCookie: migration.createLegacyIdentityCookie,
    handleResponseForIdSyncs,
    getEcidFromResponse
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

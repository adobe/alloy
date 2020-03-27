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

import { fireReferrerHideableImage } from "../../utils";
import processIdSyncsFactory from "./processIdSyncsFactory";
import configValidators from "./configValidators";

import createComponent from "./createComponent";
import handleEcidForIdMigrationFactory from "./handleEcidForIdMigrationFactory";
import createMigration from "./createMigration";
import handleResponseForIdSyncsFactory from "./handleResponseForIdSyncsFactory";
import syncRequestWithIdentityRetrievalFactory from "./syncRequestWithIdentityRetrievalFactory";
import createCustomerIds from "./customerIds/createCustomerIds";
import addEcidQueryToEvent from "./addEcidQueryToEvent";
import hasIdentityCookieFactory from "./hasIdentityCookieFactory";
import setDomainForInitialIdentityPayloadFactory from "./setDomainForInitialIdentityPayloadFactory";
import addEcidFromLegacyToPayloadFactory from "./addEcidFromLegacyToPayloadFactory";
import addEcidToPayload from "./addEcidToPayload";
import awaitIdentityCookieFactory from "./awaitIdentityCookieFactory";
import getEcidFromResponse from "./getEcidFromResponse";

const createIdentity = ({ config, logger, consent, eventManager }) => {
  const { orgId, idMigrationEnabled, thirdPartyCookiesEnabled } = config;
  const customerIds = createCustomerIds({ eventManager, consent, logger });
  const migration = createMigration({ orgId, consent, logger });
  const hasIdentityCookie = hasIdentityCookieFactory({ orgId });
  const setDomainForInitialIdentityPayload = setDomainForInitialIdentityPayloadFactory(
    {
      thirdPartyCookiesEnabled
    }
  );
  const addEcidFromLegacyToPayload = addEcidFromLegacyToPayloadFactory({
    idMigrationEnabled,
    migration,
    addEcidToPayload
  });
  const awaitIdentityCookie = awaitIdentityCookieFactory({
    orgId,
    hasIdentityCookie
  });
  const syncRequestWithIdentityRetrieval = syncRequestWithIdentityRetrievalFactory(
    {
      hasIdentityCookie,
      setDomainForInitialIdentityPayload,
      addEcidFromLegacyToPayload,
      awaitIdentityCookie,
      logger
    }
  );
  const processIdSyncs = processIdSyncsFactory({
    fireReferrerHideableImage,
    logger
  });
  const handleEcidForIdMigration = handleEcidForIdMigrationFactory({
    idMigrationEnabled,
    migration
  });
  const handleResponseForIdSyncs = handleResponseForIdSyncsFactory({
    processIdSyncs
  });
  return createComponent({
    addEcidQueryToEvent,
    customerIds,
    syncRequestWithIdentityRetrieval,
    handleEcidForIdMigration,
    handleResponseForIdSyncs,
    getEcidFromResponse
  });
};

createIdentity.namespace = "Identity";
createIdentity.configValidators = configValidators;

export default createIdentity;

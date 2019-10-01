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

import { defer } from "../../utils";
import { boolean, number } from "../../utils/configValidators";
import createIdSyncs from "./createIdSyncs";
import createManualIdSyncs from "./createManualIdSyncs";
import createCustomerIds from "./customerIds/createCustomerIds";

import { COOKIE_NAMES } from "./constants";

const { EXPERIENCE_CLOUD_ID } = COOKIE_NAMES;

const addIdsContext = (payload, ecid) => {
  payload.addIdentity(EXPERIENCE_CLOUD_ID, {
    id: ecid
  });
};

const createIdentity = ({ config, logger, cookieJar, network }) => {
  // We avoid reading the ECID from the cookie right away, because we
  // need to wait for the user to opt in first.
  const getEcid = () => cookieJar.get(EXPERIENCE_CLOUD_ID);
  let optIn;
  let deferredForEcid;
  let lifecycle;
  let customerIds;
  const idSyncs = createIdSyncs(config, logger, cookieJar);
  const manualIdSyncs = createManualIdSyncs(config, logger, cookieJar, idSyncs);
  let alreadyQueriedForIdSyncs = false;
  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, optIn } = tools);
        customerIds = createCustomerIds(cookieJar, lifecycle, network, optIn);

        // #if _REACTOR
        // This is a way for the ECID data element in the Reactor extension
        // to get the ECID synchronously since data elements are required
        // to be synchronous.
        config.reactorRegisterGetEcid(() => {
          return optIn.isOptedIn() ? getEcid() : undefined;
        });
        // #endif
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onBeforeEvent({ event }) {
        return optIn.whenOptedIn().then(() => {
          const identityQuery = {
            identity: {}
          };
          let sendIdentityQuery = false;

          if (
            !alreadyQueriedForIdSyncs &&
            config.idSyncEnabled &&
            idSyncs.hasExpired()
          ) {
            alreadyQueriedForIdSyncs = true;
            identityQuery.identity.exchange = true;
            sendIdentityQuery = true;

            if (config.idSyncContainerId !== undefined) {
              identityQuery.identity.containerId = config.idSyncContainerId;
            }
          }

          if (config.thirdPartyCookiesEnabled === false) {
            identityQuery.identity.thirdPartyCookiesEnabled = false;
            sendIdentityQuery = true;
          }

          if (sendIdentityQuery) {
            event.mergeQuery(identityQuery);
          }
        });
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      // TO-DOCUMENT: We wait for ECID before trigger any events.
      onBeforeDataCollection({ payload }) {
        return optIn.whenOptedIn().then(() => {
          const ecid = getEcid();

          let promise;

          if (ecid) {
            addIdsContext(payload, ecid);
          } else if (deferredForEcid) {
            // We don't have an ECID, but the first request has gone out to
            // fetch it. We must wait for the response to come back with the
            // ECID before we can apply it to this payload.
            logger.log("Delaying request while retrieving ECID from server.");
            promise = deferredForEcid.promise.then(() => {
              logger.log("Resuming previously delayed request.");
              addIdsContext(payload, getEcid());
            });
          } else {
            // We don't have an ECID and no request has gone out to fetch it.
            // We won't apply the ECID to this request, but we'll set up a
            // promise so that future requests can know when the ECID has returned.
            deferredForEcid = defer();
            payload.expectResponse();
          }
          customerIds.addToPayload(payload);
          return promise;
        });
      },
      // Waiting for opt-in because we'll be writing the ECID to a cookie
      onResponse({ response }) {
        return optIn.whenOptedIn().then(() => {
          const ecidPayloads = response.getPayloadsByType("identity:persist");

          if (ecidPayloads.length > 0) {
            cookieJar.set(EXPERIENCE_CLOUD_ID, ecidPayloads[0].id);

            if (deferredForEcid) {
              deferredForEcid.resolve();
            }
          }

          idSyncs.process(response.getPayloadsByType("identity:exchange"));
        });
      }
    },
    commands: {
      getEcid() {
        return optIn.whenOptedIn().then(getEcid);
      },
      setCustomerIds(options) {
        return optIn.whenOptedIn().then(() => customerIds.sync(options));
      },
      syncIdsByUrl(options) {
        return optIn
          .whenOptedIn()
          .then(() => manualIdSyncs.syncIdsByUrl(options));
      }
    }
  };
};

createIdentity.namespace = "Identity";
createIdentity.abbreviation = "ID";

createIdentity.configValidators = {
  idSyncEnabled: {
    defaultValue: true,
    validate: boolean()
  },
  idSyncContainerId: {
    defaultValue: undefined,
    validate: number()
      .integer()
      .minimum(0)
      .expected("an integer greater than or equal to 0")
  },
  thirdPartyCookiesEnabled: {
    defaultValue: true,
    validate: boolean()
  }
};

// #if _REACTOR
// Not much need to validate since we are our own consumer.
createIdentity.configValidators.reactorRegisterGetEcid = {
  defaultValue: () => {}
};
// #endif

export default createIdentity;

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
import { nonNegativeInteger } from "../../utils/configValidators";
import createIdSyncs from "./createIdSyncs";
import { COOKIE_NAMES } from "./constants";
import setCustomerIds from "./setCustomerIds";

const { EXPERIENCE_CLOUD_ID } = COOKIE_NAMES;

const addIdsContext = (payload, ecid) => {
  // TODO: Add customer ids.
  payload.addIdentity(EXPERIENCE_CLOUD_ID, {
    id: ecid
  });
};

const createIdentity = ({ config, logger, cookieJar }) => {
  // We avoid reading the ECID from the cookie right away, because we
  // need to wait for the user to opt in first.
  const getEcid = () => cookieJar.get(EXPERIENCE_CLOUD_ID);
  let optIn;
  let deferredForEcid;
  let network;
  let lifecycle;
  const idSyncs = createIdSyncs(config, logger, cookieJar);
  let alreadyQueriedForIdSyncs = false;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, network, optIn } = tools);

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
      onBeforeEvent(event) {
        return optIn.whenOptedIn().then(() => {
          if (
            !alreadyQueriedForIdSyncs &&
            config.idSyncsEnabled &&
            idSyncs.hasExpired()
          ) {
            alreadyQueriedForIdSyncs = true;
            const identityQuery = {
              identity: {
                exchange: true
              }
            };

            if (config.idSyncContainerId !== undefined) {
              identityQuery.identity.containerId = config.idSyncContainerId;
            }

            event.mergeQuery(identityQuery);
          }
        });
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      // TO-DOCUMENT: We wait for ECID before trigger any events.
      onBeforeDataCollection(payload) {
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

          return promise;
        });
      },
      // Waiting for opt-in because we'll be writing the ECID to a cookie
      onResponse(response) {
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
      // TODO: Discuss renaming of CustomerIds to UserIds
      setCustomerIds(options) {
        return optIn
          .whenOptedIn()
          .then(() =>
            setCustomerIds(options, cookieJar, lifecycle, network, optIn)
          );
      }
    }
  };
};

createIdentity.namespace = "Identity";
createIdentity.abbreviation = "ID";

createIdentity.configValidators = {
  idSyncsEnabled: {
    defaultValue: true
  },
  idSyncContainerId: {
    validate: nonNegativeInteger
  }
};

// #if _REACTOR
// Not much need to validate since we are our own consumer.
createIdentity.configValidators.reactorRegisterGetEcid = {
  defaultValue: () => {}
};
// #endif

export default createIdentity;

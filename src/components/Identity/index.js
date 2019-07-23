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
import processIdSyncs from "./processIdSyncs";
import createEvent from "../DataCollector/createEvent";
import {
  serializeCustomerIds,
  createHashFromString,
  validateCustomerIds,
  normalizeCustomerIds
} from "./util";

import { COOKIE_NAMES } from "./constants";

const { CUSTOMER_ID_HASH, EXPERIENCE_CLOUD_ID } = COOKIE_NAMES;

const addIdsContext = (payload, ecid) => {
  // TODO: Add customer ids.
  payload.addIdentity(EXPERIENCE_CLOUD_ID, {
    id: ecid
  });
};

const createIdentity = ({ config, logger, cookie }) => {
  // We avoid reading the ECID from the cookie right away, because we
  // need to wait for the user to opt in first.
  const getEcid = () => cookie.get(EXPERIENCE_CLOUD_ID);
  let optIn;
  let responseRequested = false;
  let deferredForEcid;
  let network;
  let lifecycle;
  const customerIds = {};
  const getCustomerIds = () => customerIds;

  const makeServerCall = event => {
    const payload = network.createPayload();
    payload.addEvent(event);
    const responsePromise = Promise.resolve()
      .then(() => {
        return lifecycle.onBeforeDataCollection(payload, responsePromise);
      })
      .then(() => {
        return network.sendRequest(payload, payload.expectsResponse);
      });

    return responsePromise;
  };

  const setCustomerIds = ids => {
    validateCustomerIds(ids);
    const event = createEvent();
    Object.keys(ids).forEach(key => {
      customerIds[key] = ids[key];
    });
    const normalizedCustomerIds = normalizeCustomerIds(customerIds);
    const customerIdsHash = createHashFromString(
      serializeCustomerIds(normalizedCustomerIds)
    );
    const hasSynced = customerIdsHash === cookie.get(CUSTOMER_ID_HASH);
    event.mergeMeta({ identity: { customerIds, hasSynced } });

    if (!hasSynced) {
      cookie.set(CUSTOMER_ID_HASH, customerIdsHash);
    }
    return lifecycle
      .onBeforeEvent(event, ids)
      .then(() => makeServerCall(event));
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ lifecycle, network, optIn } = tools);
      },
      // Waiting for opt-in because we'll be reading the ECID from a cookie
      onBeforeEvent(event) {
        return optIn.whenOptedIn().then(() => {
          const ecid = getEcid();
          if (!ecid && !responseRequested) {
            event.expectResponse();
            responseRequested = true;
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
              addIdsContext(payload, ecid);
            });
          } else {
            // We don't have an ECID and no request has gone out to fetch it.
            // We won't apply the ECID to this request, but we'll set up a
            // promise so that future requests can know when the ECID has returned.
            deferredForEcid = defer();
          }

          return promise;
        });
      },
      // Waiting for opt-in because we'll be writing the ECID to a cookie
      onResponse(response) {
        return optIn.whenOptedIn().then(() => {
          const ecidPayload = response.getPayloadByType("identity:persist");

          if (ecidPayload) {
            cookie.set(EXPERIENCE_CLOUD_ID, ecidPayload.id);

            if (deferredForEcid) {
              deferredForEcid.resolve();
            }
          }

          const idSyncs = response.getPayloadByType("identity:exchange") || [];

          processIdSyncs({
            destinations: idSyncs,
            config,
            logger
          });
        });
      }
    },
    commands: {
      getEcid() {
        return optIn.whenOptedIn().then(getEcid);
      },
      setCustomerIds(options) {
        return optIn.whenOptedIn().then(setCustomerIds(options));
      },
      getCustomerIds() {
        return optIn.whenOptedIn().then(getCustomerIds);
      }
    }
  };
};

createIdentity.namespace = "Identity";

createIdentity.configValidators = {
  idSyncsEnabled: {
    defaultValue: true
  }
};

export default createIdentity;

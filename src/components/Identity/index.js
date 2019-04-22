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

import { cookie, defer } from "../../utils";

const ECID_NAMESPACE = "ECID";

const addIdsContext = (payload, ecid) => {
  // TODO: Add customer ids.
  payload.addIdentity(ECID_NAMESPACE, {
    id: ecid
  });
};

// TODO: Namespace the cookie to be specific to the org.
const getEcid = () => cookie.get("ecid");

const createIdentity = () => {
  let ecid = getEcid();
  let deferredForEcid;

  // TO-DOCUMENT: We wait for ECID before trigger any events.
  const onBeforeRequest = payload => {
    payload.mergeMeta({
      identity: {
        lastSyncTS: 1222,
        containerId: 1
      }
    });

    let promise;

    if (ecid) {
      addIdsContext(payload, ecid);
    } else if (deferredForEcid) {
      // We don't have an ECID, but the first request has gone out to
      // fetch it. We must wait for the response to come back with the
      // ECID before we can apply it to this payload.
      promise = deferredForEcid.promise.then(() => {
        addIdsContext(payload, ecid);
      });
    } else {
      // We don't have an ECID and no request has gone out to fetch it.
      // We won't apply the ECID to this request, but we'll set up a
      // promise so that future requests can know when the ECID has returned.
      deferredForEcid = defer();
    }

    return promise;
  };

  const onResponse = response => {
    const ecidPayload = response.getPayloadByType("identity:persist");

    if (ecidPayload) {
      ecid = ecidPayload.id;
      cookie.set("ecid", ecid, { expires: 7 });

      if (deferredForEcid) {
        deferredForEcid.resolve();
      }
    }
  };

  return {
    lifecycle: {
      onBeforeRequest,
      onResponse
    },
    commands: {
      getEcid
    }
  };
};

createIdentity.namespace = "Identity";

export default createIdentity;

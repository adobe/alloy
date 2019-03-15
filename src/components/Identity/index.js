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

import cookie from "@adobe/reactor-cookie";

const ECID_NAMESPACE = "4";

export default () => {
  const getEcid = () => cookie.get("ecid");

  const addIdsContext = payload => {
    const ecid = getEcid();
    // TODO: Add customer ids.
    // TODO: Add sugar APIs to payload to support adding
    // specific contexts: payload.addIdentityContext
    const identityMap = {};

    if (ecid) {
      identityMap[ECID_NAMESPACE] = [
        {
          id: ecid
        }
      ];
    }

    payload.addContext({
      identityMap
    });
  };

  return {
    namespace: "Identity",
    lifecycle: {
      onBeforeEvent: addIdsContext,
      onBeforeViewStart(payload) {
        console.log("Identity:::onBeforeEvent");
        addIdsContext(payload);
        // TODO: Store `lastSyncTS` client side and pass it
        // for server to decide if we receive ID Syncs.
        payload.addMetadata({
          identity: {
            lastSyncTS: 1222,
            containerId: 1
          }
        });
      },
      onViewStartResponse(response) {
        console.log("Identity:::onViewStartResponse");
        const ecidPayload = response.getPayloadByType("identity:persist") || {};
        cookie.set("ecid", ecidPayload.id, { expires: 7 });
      }
    },
    commands: {
      getEcid() {
        return cookie.get("ecid");
      }
    }
  };
};

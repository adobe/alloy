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

export default () => {
  let hasIdSyncsExpired = true;

  return {
    namespace: "Identity",
    lifecycle: {
      onBeforeEvent(payload) {
        console.log("Identity:::onBeforeEvent");
        if (hasIdSyncsExpired) {
          payload.appendToQuery({
            identity: {
              idSyncs: true,
              container_id: 7
            }
          });
          hasIdSyncsExpired = false;
        }
      },
      onViewStartResponse({ ids: { ecid } }) {
        console.log("Identity:::onViewStartResponse");
        cookie.set("ecid", ecid, { expires: 7 });
      }
    },
    commands: {
      getEcid({ callback }) {
        // TODO: An example where not passing callbacks to commands might
        // be cleaner; the `atag` fn instead would call it after the commands
        // return.
        const ecid = cookie.get("ecid");
        callback(ecid);
        return ecid;
      }
    }
  };
};

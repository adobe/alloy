/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import ecidNamespace from "../../constants/ecidNamespace.js";

export default ({ getLegacyEcid, addEcidToPayload }) => {
  return payload => {
    if (payload.hasIdentity(ecidNamespace)) {
      // don't get the legacy identity if we already have the query string identity or if
      // the user specified it in the identity map
      return Promise.resolve();
    }
    return getLegacyEcid().then(ecidToMigrate => {
      if (ecidToMigrate) {
        addEcidToPayload(payload, ecidToMigrate);
      }
    });
  };
};

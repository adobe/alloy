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

import { endsWith, isLegacyCookieName, isNamespacedCookieName } from "../utils";
import convertTimes, { DAY, SECOND } from "../utils/convertTimes";

const STATE_STORE_HANDLE_TYPE = "state:store";

export default ({ cookieJar, orgId, apexDomain }) => {
  return {
    /**
     * When sending to a third-party endpoint, the endpoint won't be able to
     * access first-party cookies, therefore we transfer cookies into
     * the request body so they can be read by the server.
     */
    cookiesToPayload(payload, endpointDomain) {
      const isEndpointFirstParty = endsWith(endpointDomain, apexDomain);

      const state = {
        domain: apexDomain,
        cookiesEnabled: true
      };

      // If the endpoint is first-party, there's no need to transfer cookies
      // to the payload since they'll be automatically passed through cookie
      // headers.
      if (!isEndpointFirstParty) {
        const cookies = cookieJar.get();

        const entries = Object.keys(cookies)
          .filter(name => {
            // We have a contract with the server that we will pass
            // all cookies whose names are namespaced according to the
            // logic in isNamespacedCookieName as well as any legacy
            // cookie names (so that the server can handle migrating
            // identities on websites previously using Visitor.js)
            return (
              isNamespacedCookieName(orgId, name) || isLegacyCookieName(name)
            );
          })
          .map(qualifyingCookieName => {
            return {
              key: qualifyingCookieName,
              value: cookies[qualifyingCookieName]
            };
          });

        if (entries.length) {
          state.entries = entries;
        }
      }

      payload.mergeState(state);
    },
    /**
     * When receiving from a third-party endpoint, the endpoint won't be able to
     * write first-party cookies, therefore we write first-party cookies
     * as directed in the response body.
     */
    responseToCookies(response) {
      response.getPayloadsByType(STATE_STORE_HANDLE_TYPE).forEach(stateItem => {
        const options = { domain: apexDomain };

        if (stateItem.maxAge !== undefined) {
          // cookieJar expects "expires" in days
          options.expires = convertTimes(SECOND, DAY, stateItem.maxAge);
        }

        cookieJar.set(stateItem.key, stateItem.value, options);
      });
    }
  };
};

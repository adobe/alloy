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
const STATE_STORE_HANDLE_TYPE = "state:store";

export default ({
  cookieJar,
  shouldTransferCookie,
  apexDomain,
  dateProvider,
}) => {
  return {
    /**
     * When sending to a third-party endpoint, the endpoint won't be able to
     * access first-party cookies, therefore we transfer cookies into
     * the request body so they can be read by the server.
     */
    cookiesToPayload(payload, endpointDomain) {
      const isEndpointFirstParty = endpointDomain.endsWith(apexDomain);

      const state = {
        domain: apexDomain,
        cookiesEnabled: true,
      };

      // If the endpoint is first-party, there's no need to transfer cookies
      // to the payload since they'll be automatically passed through cookie
      // headers.
      if (!isEndpointFirstParty) {
        const cookies = cookieJar.get();

        const entries = Object.keys(cookies)
          .filter(shouldTransferCookie)
          .map((qualifyingCookieName) => {
            return {
              key: qualifyingCookieName,
              value: cookies[qualifyingCookieName],
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
      response
        .getPayloadsByType(STATE_STORE_HANDLE_TYPE)
        .forEach((stateItem) => {
          const options = { domain: apexDomain };

          const sameSite =
            stateItem.attrs &&
            stateItem.attrs.SameSite &&
            stateItem.attrs.SameSite.toLowerCase();

          if (stateItem.maxAge !== undefined) {
            // cookieJar expects "expires" as a date object
            options.expires = new Date(
              dateProvider().getTime() + stateItem.maxAge * 1000,
            );
          }
          if (sameSite !== undefined) {
            options.sameSite = sameSite;
          }
          // When sameSite is set to none, the secure flag must be set.
          // Experience edge will not set the secure flag in these cases.
          if (sameSite === "none") {
            options.secure = true;
          }

          cookieJar.set(stateItem.key, stateItem.value, options);
        });
    },
  };
};

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
  shouldTransferCookie,
  getState,
  updateState,
}) => {
  return {
    /**
     * When sending to a third-party endpoint, the endpoint won't be able to
     * access first-party cookies, therefore we transfer cookies into
     * the request body so they can be read by the server.
     */
    cookiesToPayload(payload, endpointDomain) {
      // localhost is a special case where the apexDomain is ""
      // We want to treat localhost as a third-party domain.
      payload.mergeState(getState(endpointDomain, shouldTransferCookie));
    },
    /**
     * When receiving from a third-party endpoint, the endpoint won't be able to
     * write first-party cookies, therefore we write first-party cookies
     * as directed in the response body.
     */
    responseToCookies(response) {
      updateState(response.getPayloadsByType(STATE_STORE_HANDLE_TYPE));
    },
  };
};

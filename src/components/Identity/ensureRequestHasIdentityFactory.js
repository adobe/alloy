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

// TO-DOCUMENT: We queue subsequent requests until we have an identity cookie.
export default ({
  doesIdentityCookieExist,
  setDomainForInitialIdentityPayload,
  addEcidFromLegacyToPayload,
  awaitIdentityCookie,
  logger
}) => {
  let identityCookiePromise;
  /**
   * Ensures that if no identity cookie exists, we only let one request be
   * sent without an identity until its response returns. In the meantime,
   * we queue all other requests, otherwise the requests could result in
   * multiple ECIDs being minted for the user. Once the response to the first
   * request returns, we can let the queued requests be sent, since they
   * will have the newly minted ECID that was returned on the first response.
   */
  return ({ payload, onResponse }) => {
    if (doesIdentityCookieExist()) {
      return Promise.resolve();
    }

    if (identityCookiePromise) {
      // We don't have an identity cookie, but the first request has
      // been sent to get it. We must wait for the response to the first
      // request to come back and a cookie set before we can let this
      // request go out.
      logger.log("Delaying request while retrieving ECID from server.");
      return identityCookiePromise.then(() => {
        logger.log("Resuming previously delayed request.");
      });
    }

    // For Alloy+Konductor communication to be as robust as possible and
    // to ensure we don't mint new ECIDs for requests that would otherwise
    // be sent in parallel, we'll let this request go out to fetch the
    // cookie, but we'll set up a promise so that future requests can
    // know when the cookie has been set.
    identityCookiePromise = awaitIdentityCookie(onResponse);
    setDomainForInitialIdentityPayload(payload);
    return addEcidFromLegacyToPayload(payload);
  };
};

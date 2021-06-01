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
  addLegacyEcidToPayload,
  awaitIdentityCookie,
  logger
}) => {
  let obtainedIdentityPromise;

  const allowRequestToGoWithoutIdentity = request => {
    setDomainForInitialIdentityPayload(request);
    return addLegacyEcidToPayload(request.getPayload());
  };

  /**
   * Ensures that if no identity cookie exists, we only let one request at a
   * time without an identity until its response returns. In the meantime,
   * we queue all other requests, otherwise the requests could result in
   * multiple ECIDs being minted for the user. Once we get an identity
   * cookie, we can let the queued requests be sent all at once, since they
   * will have the newly minted ECID.
   *
   * Konductor should make every effort to return an identity, but in
   * certain scenarios it may not. For example, in cases where the
   * request does not match what Konductor is expecting (ie 400s).
   * In cases where Konductor does not set an identity, there should be
   * no events recorded so we don't need to worry about multiple ECIDs
   * being minted for each user.
   *
   * The reason we allow for multiple sequential requests to be sent without
   * an identity is to prevent a single malformed request causing all other
   * requests to never send.
   */
  return ({ request, onResponse, onRequestFailure }) => {
    if (doesIdentityCookieExist()) {
      request.setIsIdentityEstablished();
      return Promise.resolve();
    }

    if (obtainedIdentityPromise) {
      // We don't have an identity cookie, but at least one request has
      // been sent to get it. Konductor may set the identity cookie in the
      // response. We will hold up this request until the last request
      // requiring identity returns and awaitIdentityCookie confirms the
      // identity was set.
      logger.info("Delaying request while retrieving ECID from server.");
      const previousObtainedIdentityPromise = obtainedIdentityPromise;

      // This promise resolves when we have an identity cookie. Additional
      // requests are chained together so that only one is sent at a time
      // until we have the identity cookie.
      obtainedIdentityPromise = previousObtainedIdentityPromise.catch(() => {
        return awaitIdentityCookie({ onResponse, onRequestFailure });
      });

      // When this returned promise resolves, the request will go out.
      return (
        previousObtainedIdentityPromise
          .then(() => {
            logger.info("Resuming previously delayed request.");
            request.setIsIdentityEstablished();
          })
          // If Konductor did not set the identity cookie on the previous
          // request, then awaitIdentityCookie will reject its promise.
          // Catch the rejection here and allow this request to go out.
          .catch(() => {
            return allowRequestToGoWithoutIdentity(request);
          })
      );
    }

    // For Alloy+Konductor communication to be as robust as possible and
    // to ensure we don't mint new ECIDs for requests that would otherwise
    // be sent in parallel, we'll let this request go out to fetch the
    // cookie
    obtainedIdentityPromise = awaitIdentityCookie({
      onResponse,
      onRequestFailure
    });
    return allowRequestToGoWithoutIdentity(request);
  };
};

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

import { domainMatchesApex } from "../../utils";

export default ({
  orgId,
  doesIdentityCookieExist,
  extractOrgIdsFromCookies,
  edgeDomain,
  apexDomain
}) => {
  /**
   * Returns a promise that will be resolved once an identity cookie exists.
   * If an identity cookie doesn't already exist, it should always exist after
   * the first response.
   */
  return ({ onResponse, onRequestFailure }) => {
    return new Promise((resolve, reject) => {
      onResponse(() => {
        if (doesIdentityCookieExist()) {
          resolve();
        } else {
          let errorMessage;

          const orgIdsFromCookies = extractOrgIdsFromCookies();
          if (
            orgIdsFromCookies.length > 0 &&
            !orgIdsFromCookies.includes(orgId)
          ) {
            errorMessage = `An identity for organzation ${orgId} was not found. Valid organizations on this page are: ${orgIdsFromCookies.join(
              ", "
            )}`;
          } else if (!domainMatchesApex(edgeDomain, apexDomain)) {
            errorMessage = `An identity was not set properly because edge domain ${edgeDomain} does not match apex domain ${apexDomain}, and ${apexDomain} may not allow third-party cookies.`;
          } else {
            errorMessage = `An identity was not set properly. Please verify that cookies returned from ${edgeDomain} can be set on this page.`;
          }

          const err = new Error(errorMessage);

          // Rejecting the promise will reject commands that were queued
          // by the Identity component while waiting on the response to
          // the initial request.
          reject(err);

          // Throwing an error will reject the event command that initiated
          // the request.
          throw err;
        }
      });
      onRequestFailure(() => {
        if (doesIdentityCookieExist()) {
          resolve();
        } else {
          // The error from the request failure will be logged separately. Rejecting this here
          // will tell ensureSingleIdentity to send the next request without identity
          reject(new Error("No identity was set on response."));
        }
      });
    });
  };
};

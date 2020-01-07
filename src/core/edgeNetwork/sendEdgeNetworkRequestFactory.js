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

import { ID_THIRD_PARTY_DOMAIN } from "../../constants/domains";
import apiVersion from "../../constants/apiVersion";
import { uuid } from "../../utils";

export default ({
  config,
  logger,
  lifecycle,
  cookieTransfer,
  sendNetworkRequest,
  createResponse,
  processWarningsAndErrors
}) => {
  const { edgeDomain, edgeBasePath, configId } = config;

  /**
   * Sends a network request that is aware of payload interfaces,
   * lifecycle methods, configured edge domains, response structures, etc.
   */
  return ({ payload, action }) => {
    const endpointDomain = payload.getUseIdThirdPartyDomain()
      ? ID_THIRD_PARTY_DOMAIN
      : edgeDomain;
    const requestId = uuid();
    const url = `https://${endpointDomain}/${edgeBasePath}/${apiVersion}/${action}?configId=${configId}&requestId=${requestId}`;

    cookieTransfer.cookiesToPayload(payload, endpointDomain);
    return sendNetworkRequest({ payload, url, requestId })
      .catch(error => {
        // If we get to here, it's most likely that the network request
        // didn't actually get to the server (e.g., no internet connection).
        const throwError = () => {
          throw error;
        };
        return lifecycle.onRequestFailure().then(throwError, throwError);
      })
      .then(result => {
        let response;

        // Whether a parsedBody exists is largely independent of success. For
        // example, a request can be successful without a body in the response.
        // On the other hand, a 500 status code could have been returned but
        // with a body in the response containing warnings and errors.
        if (result.parsedBody) {
          response = createResponse(result.parsedBody);
          cookieTransfer.responseToCookies(response);
        }

        let lifecyclePromise;

        if (result.success) {
          if (response) {
            lifecyclePromise = lifecycle.onResponse({ response });
          }
        } else {
          lifecyclePromise = lifecycle.onRequestFailure();
        }

        lifecyclePromise = lifecyclePromise || Promise.resolve();

        return lifecyclePromise.then(() => {
          // We process warnings and errors after calling lifecycle
          // methods because warning and error processing can throw an
          // error that needs to get bubbled up to the promise returned to
          // the customer, but we want to make sure lifecycle methods are
          // still called in such a case and this is the easiest way to
          // make that happen.
          if (response) {
            processWarningsAndErrors(response, logger);
          }

          if (!result.success) {
            const messageSuffix = result.body
              ? `response body: ${result.body}`
              : `no response body.`;
            throw new Error(
              `Unexpected server response with status code ${result.statusCode} and ${messageSuffix}`
            );
          }
        });
      });
  };
};

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
import { createCallbackAggregator, noop, uuid } from "../../utils";
import { NO_CONTENT } from "../../constants/httpStatusCode";

export default ({
  config,
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
  return ({
    payload,
    action,
    onResponseBeforeFullErrorProcessing = noop,
    onRequestFailure = noop
  }) => {
    const endpointDomain = payload.getUseIdThirdPartyDomain()
      ? ID_THIRD_PARTY_DOMAIN
      : edgeDomain;
    const requestId = uuid();
    const url = `https://${endpointDomain}/${edgeBasePath}/${apiVersion}/${action}?configId=${configId}&requestId=${requestId}`;

    const onResponseCallbackAggregator = createCallbackAggregator();
    onResponseCallbackAggregator.add(lifecycle.onResponse);
    onResponseCallbackAggregator.add(onResponseBeforeFullErrorProcessing);

    const onRequestFailureCallbackAggregator = createCallbackAggregator();
    onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
    onRequestFailureCallbackAggregator.add(onRequestFailure);

    cookieTransfer.cookiesToPayload(payload, endpointDomain);

    return lifecycle
      .onBeforeRequest({
        payload,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      })
      .then(() => {
        return sendNetworkRequest({ payload, url, requestId });
      })
      .then(result => {
        if (result.statusCode !== NO_CONTENT && !result.parsedBody) {
          const messageSuffix = result.body
            ? `response body: ${result.body}`
            : `no response body.`;
          throw new Error(
            `Unexpected server response with status code ${result.statusCode} and ${messageSuffix}`
          );
        }
        return result;
      })
      .catch(error => {
        // Catch errors that came from sendNetworkRequest (like if there's
        // no internet connection) or the error we throw above due to no
        // parsed body, because we handle them the same way.
        const throwError = () => {
          throw error;
        };
        return onRequestFailureCallbackAggregator
          .call({ error })
          .then(throwError, throwError);
      })
      .then(result => {
        // Note that result.parsedBody may be undefined if it was a
        // 204 No Content response. That's fine.
        const response = createResponse(result.parsedBody);
        cookieTransfer.responseToCookies(response);

        return onResponseCallbackAggregator.call({ response }).then(() => {
          // This line's location is very important.
          // As long as we received a properly structured response,
          // we consider the response sucessful enough to call lifecycle
          // onResponse methods. However, a structured response from the
          // server may ALSO containing errors. Because of this, we make
          // sure we call lifecycle onResponse methods, then later
          // process the warnings and errors.
          // If there are errors in the response body, an error will
          // be thrown here which should ultimately reject the promise that
          // was returned to the customer for the command they executed.
          processWarningsAndErrors(response);
          return response;
        });
      });
  };
};

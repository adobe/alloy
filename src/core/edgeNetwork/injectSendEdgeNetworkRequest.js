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

import { ID_THIRD_PARTY as ID_THIRD_PARTY_DOMAIN } from "../../constants/domain";
import apiVersion from "../../constants/apiVersion";
import { createCallbackAggregator, noop, assign } from "../../utils";

const extractResponseFromServerState = serverState => {
  const { response = {} } = serverState;
  const { headers = {}, body = {} } = response;

  const getHeader = key => headers[key];

  return {
    statusCode: 200,
    body: JSON.stringify(body),
    parsedBody: body,
    getHeader
  };
};

export default ({
  config,
  lifecycle,
  cookieTransfer,
  sendNetworkRequest,
  createResponse,
  processWarningsAndErrors
}) => {
  const { edgeDomain, edgeBasePath, edgeConfigId } = config;

  /**
   * Sends a network request that is aware of payload interfaces,
   * lifecycle methods, configured edge domains, response structures, etc.
   */
  return ({
    request,
    runOnResponseCallbacks = noop,
    runOnRequestFailureCallbacks = noop,
    serverState = undefined
  }) => {
    const onResponseCallbackAggregator = createCallbackAggregator();
    onResponseCallbackAggregator.add(lifecycle.onResponse);
    onResponseCallbackAggregator.add(runOnResponseCallbacks);

    const onRequestFailureCallbackAggregator = createCallbackAggregator();
    onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
    onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);

    return lifecycle
      .onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      })
      .then(() => {
        const endpointDomain = request.getUseIdThirdPartyDomain()
          ? ID_THIRD_PARTY_DOMAIN
          : edgeDomain;

        const pathFromCookie = cookieTransfer.getPathFromCookie();

        const basePath =
          pathFromCookie !== undefined
            ? pathFromCookie
            : `${endpointDomain}/${edgeBasePath}`;

        const url = `https://${basePath}/${apiVersion}/${request.getAction()}?configId=${edgeConfigId}&requestId=${request.getId()}`;
        cookieTransfer.cookiesToPayload(request.getPayload(), endpointDomain);
        return serverState
          ? extractResponseFromServerState(serverState)
          : sendNetworkRequest({
              requestId: request.getId(),
              url,
              payload: request.getPayload(),
              useSendBeacon: request.getUseSendBeacon()
            });
      })
      .then(networkResponse => {
        processWarningsAndErrors(networkResponse);
        return networkResponse;
      })
      .catch(error => {
        // Regardless of whether the network call failed, an unexpected status
        // code was returned, or the response body was malformed, we want to call
        // the onRequestFailure callbacks, but still throw the exception.
        const throwError = () => {
          throw error;
        };
        return onRequestFailureCallbackAggregator
          .call({ error })
          .then(throwError, throwError);
      })
      .then(({ parsedBody, getHeader }) => {
        // Note that networkResponse.parsedBody may be undefined if it was a
        // 204 No Content response. That's fine.
        const response = createResponse({ content: parsedBody, getHeader });
        cookieTransfer.responseToCookies(response);

        // Notice we're calling the onResponse lifecycle method even if there are errors
        // inside the response body. This is because the full request didn't actually fail--
        // only portions of it that are considered non-fatal (a specific, non-critical
        // Konductor plugin, for example).
        return onResponseCallbackAggregator
          .call({
            response
          })
          .then(returnValues => {
            // Merges all returned objects from all `onResponse` callbacks into
            // a single object that can later be returned to the customer.
            const lifecycleOnResponseReturnValues = returnValues.shift() || [];
            const consumerOnResponseReturnValues = returnValues.shift() || [];
            const lifecycleOnBeforeRequestReturnValues = returnValues;
            return assign(
              {},
              ...lifecycleOnResponseReturnValues,
              ...consumerOnResponseReturnValues,
              ...lifecycleOnBeforeRequestReturnValues
            );
          });
      });
  };
};

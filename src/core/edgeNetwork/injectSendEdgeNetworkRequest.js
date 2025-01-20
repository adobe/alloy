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

import { ID_THIRD_PARTY as ID_THIRD_PARTY_DOMAIN } from "../../constants/domain.js";
import apiVersion from "../../constants/apiVersion.js";
import { createCallbackAggregator, noop } from "../../utils/index.js";
import { isNetworkError } from "../../utils/networkErrors.js";
import mergeLifecycleResponses from "./mergeLifecycleResponses.js";
import handleRequestFailure from "./handleRequestFailure.js";

const isDemdexBlockedError = (error, request) => {
  return request.getUseIdThirdPartyDomain() && isNetworkError(error);
};

export default ({
  config,
  lifecycle,
  cookieTransfer,
  sendNetworkRequest,
  createResponse,
  processWarningsAndErrors,
  getLocationHint,
  getAssuranceValidationTokenParams,
}) => {
  const { edgeDomain, edgeBasePath, datastreamId } = config;
  let hasDemdexFailed = false;

  const buildEndpointUrl = (endpointDomain, request) => {
    const locationHint = getLocationHint();
    const edgeBasePathWithLocationHint = locationHint
      ? `${edgeBasePath}/${locationHint}${request.getEdgeSubPath()}`
      : `${edgeBasePath}${request.getEdgeSubPath()}`;
    const configId = request.getDatastreamIdOverride() || datastreamId;

    if (configId !== datastreamId) {
      request.getPayload().mergeMeta({
        sdkConfig: {
          datastream: {
            original: datastreamId,
          },
        },
      });
    }

    return `https://${endpointDomain}/${edgeBasePathWithLocationHint}/${apiVersion}/${request.getAction()}?configId=${configId}&requestId=${request.getId()}${getAssuranceValidationTokenParams()}`;
  };

  /**
   * Sends a network request that is aware of payload interfaces,
   * lifecycle methods, configured edge domains, response structures, etc.
   */
  return ({
    request,
    runOnResponseCallbacks = noop,
    runOnRequestFailureCallbacks = noop,
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
        onRequestFailure: onRequestFailureCallbackAggregator.add,
      })
      .then(() => {
        const endpointDomain =
          hasDemdexFailed || !request.getUseIdThirdPartyDomain()
            ? edgeDomain
            : ID_THIRD_PARTY_DOMAIN;

        const url = buildEndpointUrl(endpointDomain, request);
        const payload = request.getPayload();
        cookieTransfer.cookiesToPayload(payload, endpointDomain);

        return sendNetworkRequest({
          requestId: request.getId(),
          url,
          payload,
          useSendBeacon: request.getUseSendBeacon(),
        });
      })
      .then((networkResponse) => {
        processWarningsAndErrors(networkResponse);
        return networkResponse;
      })
      .catch((error) => {
        if (isDemdexBlockedError(error, request)) {
          hasDemdexFailed = true;
          request.setUseIdThirdPartyDomain(false);
          const url = buildEndpointUrl(edgeDomain, request);
          const payload = request.getPayload();
          cookieTransfer.cookiesToPayload(payload, edgeDomain);

          return sendNetworkRequest({
            requestId: request.getId(),
            url,
            payload,
            useSendBeacon: request.getUseSendBeacon(),
          });
        }
        return handleRequestFailure(onRequestFailureCallbackAggregator)(error);
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
            response,
          })
          .then(mergeLifecycleResponses);
      });
  };
};

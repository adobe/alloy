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
import { createCallbackAggregator, noop } from "../../utils";
import mergeLifecycleResponses from "./mergeLifecycleResponses";
import handleRequestFailure from "./handleRequestFailure";

export default ({
  config,
  lifecycle,
  cookieTransfer,
  sendNetworkRequest,
  createResponse,
  processWarningsAndErrors,
  getLocationHint,
  getAssuranceValidationTokenParams
}) => {
  const { edgeDomain, edgeBasePath, edgeConfigId } = config;

  /**
   * Sends a network request that is aware of payload interfaces,
   * lifecycle methods, configured edge domains, response structures, etc.
   */
  return ({
    request,
    runOnResponseCallbacks = noop,
    runOnRequestFailureCallbacks = noop
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
        const locationHint = getLocationHint();
        const edgeBasePathWithLocationHint = locationHint
          ? `${edgeBasePath}/${locationHint}`
          : edgeBasePath;
        const finalEdgeConfigId =
          request.getEdgeConfigIdOverride() || edgeConfigId;
        const url = `https://${endpointDomain}/${edgeBasePathWithLocationHint}/${apiVersion}/${request.getAction()}?configId=${finalEdgeConfigId}&requestId=${request.getId()}${getAssuranceValidationTokenParams()}`;
        cookieTransfer.cookiesToPayload(request.getPayload(), endpointDomain);
        return sendNetworkRequest({
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
      .catch(handleRequestFailure(onRequestFailureCallbackAggregator))
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
          .then(mergeLifecycleResponses);
      });
  };
};

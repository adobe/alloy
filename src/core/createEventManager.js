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

import { createCallbackAggregator } from "../utils";

export default ({
  config,
  logger,
  lifecycle,
  consent,
  createEvent,
  createDataCollectionRequestPayload,
  createDataCollectionRequest,
  sendEdgeNetworkRequest
}) => {
  const { onBeforeEventSend } = config;

  const onBeforeEventSendWithLoggedExceptions = (...args) => {
    try {
      onBeforeEventSend(...args);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };

  return {
    createEvent,
    /**
     * Sends an event. This includes running the event and payload through
     * the appropriate lifecycle hooks, sending the request to the server,
     * and handling the response.
     * @param {Object} event This will be JSON stringified and used inside
     * the request payload.
     * @param {Object} [options]
     * @param {boolean} [options.renderDecisions=false]
     * @param {Array} [options.decisionScopes]
     * This will be passed to components
     * so they can take appropriate action.
     * @returns {*}
     */
    sendEvent(event, options = {}) {
      event.setLastChanceCallback(onBeforeEventSendWithLoggedExceptions);
      const { renderDecisions = false, decisionScopes } = options;
      const payload = createDataCollectionRequestPayload();
      const request = createDataCollectionRequest(payload);
      const onResponseCallbackAggregator = createCallbackAggregator();
      const onRequestFailureCallbackAggregator = createCallbackAggregator();

      return lifecycle
        .onBeforeEvent({
          event,
          renderDecisions,
          decisionScopes,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add
        })
        .then(() => {
          payload.addEvent(event);
          return consent.awaitConsent();
        })
        .then(() => {
          return sendEdgeNetworkRequest({
            request,
            runOnResponseCallbacks: onResponseCallbackAggregator.call,
            runOnRequestFailureCallbacks:
              onRequestFailureCallbackAggregator.call
          });
        });
    }
  };
};

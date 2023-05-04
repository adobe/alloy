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

import PAGE_WIDE_SCOPE from "../constants/pageWideScope";
import { createCallbackAggregator, noop } from "../utils";

const EVENT_CANCELLATION_MESSAGE =
  "Event was canceled because the onBeforeEventSend callback returned false.";

export default ({
  config,
  logger,
  lifecycle,
  consent,
  createEvent,
  createDataCollectionRequestPayload,
  createDataCollectionRequest,
  sendEdgeNetworkRequest,
  applyResponse
}) => {
  const { onBeforeEventSend } = config;

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
     * @param {Array} [options.decisionScopes] Note: this option will soon
     * be deprecated, please use *personalization.decisionScopes* instead
     * @param {Object} [options.personalization]
     * @param {Object} [options.serverState]
     * This will be passed to components
     * so they can take appropriate action.
     * @returns {*}
     */
    sendEvent(event, options = {}) {
      const {
        renderDecisions = false,
        decisionScopes,
        personalization,
        propositions
      } = options;
      const payload = createDataCollectionRequestPayload();
      const request = createDataCollectionRequest(payload);
      const onResponseCallbackAggregator = createCallbackAggregator();
      const onRequestFailureCallbackAggregator = createCallbackAggregator();

      return lifecycle
        .onBeforeEvent({
          event,
          renderDecisions,
          decisionScopes,
          personalization,
          propositions,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add
        })
        .then(() => {
          payload.addEvent(event);
          return consent.awaitConsent();
        })
        .then(() => {
          try {
            // NOTE: this calls onBeforeEventSend callback (if configured)
            event.finalize(onBeforeEventSend);
          } catch (error) {
            const throwError = () => {
              throw error;
            };
            onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
            return onRequestFailureCallbackAggregator
              .call({ error })
              .then(throwError, throwError);
          }

          // if the callback returns false, the event should not be sent
          if (!event.shouldSend()) {
            onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
            logger.info(EVENT_CANCELLATION_MESSAGE);
            const error = new Error(EVENT_CANCELLATION_MESSAGE);
            return onRequestFailureCallbackAggregator
              .call({ error })
              .then(() => {
                // Ensure the promise gets resolved with undefined instead
                // of an array of return values from the callbacks.
              });
          }

          return sendEdgeNetworkRequest({
            request,
            runOnResponseCallbacks: onResponseCallbackAggregator.call,
            runOnRequestFailureCallbacks:
              onRequestFailureCallbackAggregator.call
          });
        });
    },
    applyResponse(event, options = {}) {
      const {
        renderDecisions = false,
        responseHeaders = {},
        responseBody = { handle: [] }
      } = options;

      const payload = createDataCollectionRequestPayload();
      const request = createDataCollectionRequest(payload);
      const onResponseCallbackAggregator = createCallbackAggregator();

      return lifecycle
        .onBeforeEvent({
          event,
          renderDecisions,
          decisionScopes: [PAGE_WIDE_SCOPE],
          personalization: {},
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: noop
        })
        .then(() => {
          payload.addEvent(event);
          return applyResponse({
            request,
            responseHeaders,
            responseBody,
            runOnResponseCallbacks: onResponseCallbackAggregator.call
          });
        });
    }
  };
};

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

import PAGE_WIDE_SCOPE from "../constants/pageWideScope.js";
import { createCallbackAggregator, noop } from "../utils/index.js";
import { createRequestParams } from "../utils/request/index.js";
import type {
  DataCollectionRequestPayload,
  Request,
} from "../utils/request/types.js";
import type { Override } from "../utils/request/createRequestParams.js";
import type { ConsentManager } from "./consent/types.js";
import type { Lifecycle } from "./createLifecycle.js";
import type { EdgeRequestExecutor } from "./edgeNetwork/types.js";
import type {
  ApplyResponseOptions,
  Event,
  EventManager,
  Logger,
  OnBeforeEventSend,
  ResponseContent,
  SendEventOptions,
} from "./types.js";

/** The lifecycle hooks the event manager runs; see `createLifecycle`. */
export type EventManagerLifecycle = Pick<
  Lifecycle,
  "onBeforeEvent" | "onRequestFailure"
>;

export interface CreateEventManagerDependencies {
  config: {
    onBeforeEventSend?: OnBeforeEventSend;
    edgeConfigOverrides?: Override;
  };
  logger: Logger;
  lifecycle: EventManagerLifecycle;
  consent: Pick<ConsentManager, "awaitConsent">;
  createEvent: () => Event;
  createDataCollectionRequestPayload: () => DataCollectionRequestPayload;
  createDataCollectionRequest: (params: {
    payload: DataCollectionRequestPayload;
    datastreamIdOverride?: string;
  }) => Request<DataCollectionRequestPayload>;
  sendEdgeNetworkRequest: EdgeRequestExecutor;
  applyResponse: (options: {
    request: Request<DataCollectionRequestPayload>;
    responseHeaders: Record<string, string>;
    responseBody: ResponseContent;
    runOnResponseCallbacks: () => Promise<unknown>;
  }) => Promise<Record<string, unknown>>;
}

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
  applyResponse,
}: CreateEventManagerDependencies): EventManager => {
  const { onBeforeEventSend, edgeConfigOverrides: globalConfigOverrides } =
    config;

  return {
    createEvent,
    /**
     * Sends an event. This includes running the event and payload through the
     * appropriate lifecycle hooks, sending the request to the server, and
     * handling the response.
     * @param event - This will be JSON stringified and used inside the
     * request payload.
     * @param options - Options to pass on to the onBeforeEvent
     * lifecycle method. `edgeConfigOverrides` are settings that take
     * precedence over the global datastream configuration, including which
     * datastream to use.
     */
    sendEvent(event: Event, options: SendEventOptions = {}) {
      const { edgeConfigOverrides: localConfigOverrides, ...otherOptions } =
        options;
      const requestParams = createRequestParams({
        payload: createDataCollectionRequestPayload(),
        localConfigOverrides,
        globalConfigOverrides,
      });
      const request = createDataCollectionRequest(requestParams);
      const onResponseCallbackAggregator = createCallbackAggregator();
      const onRequestFailureCallbackAggregator = createCallbackAggregator();

      return lifecycle
        .onBeforeEvent({
          ...otherOptions,
          event,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add,
        })
        .then(() => {
          requestParams.payload.addEvent(event);
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
              .then((): undefined => {
                // Ensure the promise gets resolved with undefined instead
                // of an array of return values from the callbacks.
              });
          }

          return sendEdgeNetworkRequest({
            request,
            runOnResponseCallbacks: onResponseCallbackAggregator.call,
            runOnRequestFailureCallbacks:
              onRequestFailureCallbackAggregator.call,
          });
        });
    },
    applyResponse(event: Event, options: ApplyResponseOptions = {}) {
      const {
        renderDecisions = false,
        decisionContext = {},
        responseHeaders = {},
        responseBody = { handle: [] },
        personalization,
      } = options;

      const payload = createDataCollectionRequestPayload();
      const request = createDataCollectionRequest({ payload });
      const onResponseCallbackAggregator = createCallbackAggregator();

      return lifecycle
        .onBeforeEvent({
          event,
          renderDecisions,
          decisionContext,
          decisionScopes: [PAGE_WIDE_SCOPE],
          personalization,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: noop,
        })
        .then(() => {
          payload.addEvent(event);
          return applyResponse({
            request,
            responseHeaders,
            responseBody,
            runOnResponseCallbacks: onResponseCallbackAggregator.call,
          });
        });
    },
  };
};

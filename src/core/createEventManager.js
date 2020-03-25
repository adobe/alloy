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

export default ({
  config,
  logger,
  lifecycle,
  consent,
  createEvent,
  createDataCollectionRequestPayload,
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
     * @param {boolean} [options.isViewStart=false] Whether the event is a
     * result of the start of a view. This will be passed to components
     * so they can take appropriate action.
     * @returns {*}
     */
    sendEvent(event, options = {}) {
      event.setLastChanceCallback(onBeforeEventSendWithLoggedExceptions);
      const { isViewStart = false, scopes } = options;
      const payload = createDataCollectionRequestPayload();

      return lifecycle
        .onBeforeEvent({
          event,
          isViewStart,
          scopes,
          payload
        })
        .then(() => {
          // it's important to add the event here because the payload object will call toJSON
          // which applies the userData, userXdm, and lastChanceCallback
          payload.addEvent(event);
          return consent.awaitConsent();
        })
        .then(() => {
          return lifecycle.onBeforeDataCollectionRequest({ payload });
        })
        .then(() => {
          const documentMayUnload = event.getDocumentMayUnload();
          const expectResponse = payload.getExpectResponse();
          const reallyExpectResponse = documentMayUnload
            ? false
            : expectResponse;
          const action = reallyExpectResponse ? "interact" : "collect";
          return sendEdgeNetworkRequest({
            payload,
            action
          });
        });
    }
  };
};

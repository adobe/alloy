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

import { assignIf, isEmptyObject } from "../utils";
import { ID_THIRD_PARTY_DOMAIN } from "../constants/domains";

export default ({
  createEvent,
  createResponse,
  optIn,
  lifecycle,
  cookieTransfer,
  network,
  config,
  logger
}) => {
  const {
    edgeDomain,
    orgId,
    onBeforeEventSend,
    debugEnabled,
    datasetId,
    schemaId
  } = config;

  const onBeforeEventSendWithLoggedExceptions = (...args) => {
    try {
      onBeforeEventSend(...args);
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };

  const addMetaTo = payload => {
    const configOverrides = { orgId };

    const dataCollection = Object.create({});
    assignIf(
      dataCollection,
      { synchronousValidation: true },
      () => debugEnabled
    );
    assignIf(dataCollection, { datasetId: config.datasetId }, () => datasetId);
    assignIf(dataCollection, { schemaId: config.schemaId }, () => schemaId);

    if (!isEmptyObject(dataCollection)) {
      configOverrides.dataCollection = dataCollection;
    }

    payload.mergeConfigOverrides(configOverrides);
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
      event.lastChanceCallback = onBeforeEventSendWithLoggedExceptions;
      const { isViewStart = false } = options;
      const payload = network.createPayload();
      addMetaTo(payload);

      return lifecycle
        .onBeforeEvent({
          event,
          isViewStart,
          payload
        })
        .then(() => {
          // it's important to add the event here because the payload object will call toJSON
          // which applies the userData, userXdm, and lastChanceCallback
          payload.addEvent(event);
          return optIn.whenOptedIn();
        })
        .then(() => {
          return lifecycle.onBeforeDataCollection({ payload });
        })
        .then(() => {
          const endpointDomain = payload.shouldUseIdThirdPartyDomain
            ? ID_THIRD_PARTY_DOMAIN
            : edgeDomain;
          cookieTransfer.cookiesToPayload(payload, endpointDomain);
          return network.sendRequest(payload, endpointDomain, {
            expectsResponse: payload.expectsResponse,
            documentUnloading: event.isDocumentUnloading
          });
        })
        .catch(error => {
          // The error that we caught is more important than
          // any error that may have occurred in lifecycle.onResponseError().
          // For that reason, we make sure the caught error is the one that
          // bubbles up. We also wait until lifecycle.onRequestFailure is
          // complete before returning, so that any error that may occur
          // in lifecycle.onRequestFailure is properly suppressed if the
          // user has errorsEnabled: false in the configuration.
          // We could use finally() here, but just to be safe, we don't,
          // because finally() is only recently supported natively and may
          // not exist in customer-provided promise polyfills.
          const throwError = () => {
            throw error;
          };
          return lifecycle.onRequestFailure().then(throwError, throwError);
        })
        .then(parsedBody => {
          const response = createResponse(parsedBody);
          cookieTransfer.responseToCookies(response);

          // TODO Document that onResponse will be called when Konductor
          // sends a well-formed response even if that response contains
          // error objects. This is because even when there are error objects
          // there can be "handle" payloads to act upon. Also document
          // that onRequestFailure will be called when the network request
          // itself failed (e.g., no internet connection), when JAG throws an
          // error (the request never made it to Konductor), or when
          // Konductor returns a malformed response.
          return lifecycle.onResponse({ response }).then(() => response);
        })
        .then(response => {
          if (!response) {
            return;
          }

          const warnings = response.getWarnings();
          const errors = response.getErrors();

          warnings.forEach(warning => {
            logger.warn(
              `Warning received from server: [Code ${warning.code}] ${warning.message}`
            );
          });

          if (errors.length) {
            const errorMessage = errors.reduce((memo, error) => {
              return `${memo}\n• [Code ${error.code}] ${error.message}`;
            }, "The server responded with the following errors:");
            throw new Error(errorMessage);
          }

          // We don't want to expose the response to the customer, so
          // we'll stop its propagation at this point. Later, we may wish
          // to allow the response to propagate out of the event manager
          // but not let it propagate beyond the components using the event
          // manager.
        });
    }
  };
};

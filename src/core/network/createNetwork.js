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

import createPayload from "./createPayload";
import createResponse from "./createResponse";
import { executeWithRetry, stackError, uuid } from "../../utils";
import apiVersion from "../../constants/apiVersion";

export default (config, logger, lifecycle, networkStrategy) => {
  const handleResponse = (requestId, responseBody) => {
    let parsedBody;

    try {
      parsedBody = JSON.parse(responseBody);
    } catch (e) {
      throw new Error(
        `Error parsing server response.\n${e}\nResponse body: ${responseBody}`
      );
    }

    logger.log(`Request ${requestId}: Received response.`, parsedBody);

    const response = createResponse(parsedBody);

    return lifecycle.onResponse({ response }).then(() => response);
  };

  const { edgeDomain, propertyId } = config;

  return {
    /**
     * Create a new payload.  Once you have added data to the payload, send it with
     * the sendRequest method.
     */
    createPayload,
    /**
     * Send the request to either interact or collect based on expectsResponse.
     * When the response is returned it will call the lifecycle method "onResponse"
     * with the returned response object.
     *
     * @param {Object} payload This will be JSON stringified and sent as the post body.
     * @param {boolean} [expectsResponse=true] The endpoint and request mechanism
     * will be determined by whether a response is expected.
     * @param {boolean} [documentUnloading=false] This determines the network transport method.
     * When the document is unloading, sendBeacon is used, otherwise fetch is used.
     * @returns {Promise} a promise resolved with the response object once the response is
     * completely processed.  If expectsResponse==false, the promise will be resolved
     * with undefined.
     */
    sendRequest(payload, expectsResponse = true, documentUnloading = false) {
      const requestId = uuid();
      if (documentUnloading) {
        logger.log(`No response requested due to document unloading.`);
      }
      const reallyExpectsResponse = documentUnloading ? false : expectsResponse;
      return Promise.resolve()
        .then(() => {
          const action = reallyExpectsResponse ? "interact" : "collect";

          let baseUrl = `https://${edgeDomain}`;

          // #if _DEV
          if (config.get("localEdge")) {
            baseUrl = `http://localhost:8080`;
          }
          // #endif

          const url = `${baseUrl}/${apiVersion}/${action}?propertyId=${propertyId}`;
          const responseHandlingMessage = reallyExpectsResponse
            ? ""
            : " (no response is expected)";
          const stringifiedPayload = JSON.stringify(payload);

          // We want to log raw payload and event data rather than
          // our fancy wrapper objects. Calling payload.toJSON() is
          // insufficient to get all the nested raw data, because it's
          // not recursive (it doesn't call toJSON() on the event objects).
          // Parsing the result of JSON.stringify(), however, gives the
          // fully recursive raw data.
          // JSON.parse is expensive so we short circuit if logging is disabled.
          if (logger.enabled) {
            logger.log(
              `Request ${requestId}: Sending request${responseHandlingMessage}.`,
              JSON.parse(stringifiedPayload)
            );
          }

          return executeWithRetry(
            () => networkStrategy(url, stringifiedPayload, documentUnloading),
            3
          );
        })
        .catch(error => {
          throw stackError("Network request failed.", error);
        })
        .then(responseBody => {
          let handleResponsePromise;

          if (reallyExpectsResponse) {
            handleResponsePromise = handleResponse(requestId, responseBody);
          }

          return handleResponsePromise;
        })
        .catch(error => {
          // The network error that just occurred is more important than
          // any error that may occur in lifecycle.onResponseError(). For
          // that reason, we make sure the network error is the one that
          // bubbles up. We also wait until lifecycle.onResponseError is
          // complete before returning, so that any error that may occur
          // in lifecycle.onResponseError is properly suppressed if the
          // user has errorsEnabled: false in the configuration.
          // We could use finally() here, but just to be safe, we don't,
          // because finally() is only recently supported natively and may
          // not exist in customer-provided promise polyfills.
          const throwError = () => {
            throw error;
          };
          return lifecycle
            .onResponseError({ error })
            .then(throwError, throwError);
        });
    }
  };
};

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
import getResponseStatusType from "./getResponseStatusType";
import { stackError, uuid } from "../../utils";
import apiVersion from "../../constants/apiVersion";
import { ID_THIRD_PARTY_DOMAIN } from "../../constants/domains";
import { RETRYABLE_ERROR, SUCCESS } from "../../constants/responseStatusType";

export default ({ config, logger, lifecycle, networkStrategy }) => {
  const handleResponse = (requestId, responseBody) => {
    let parsedBody;

    try {
      // One of the cases where the response body is not JSON is when
      // JAG throws an error. In this case, the response will be plain text
      // explaining what went wrong.
      parsedBody = JSON.parse(responseBody);
    } catch (e) {
      throw new Error(
        `Unexpected server response.\n${e}\nResponse body: ${responseBody}`
      );
    }

    logger.log(`Request ${requestId}: Received response.`, parsedBody);

    const response = createResponse(parsedBody);

    // TODO Document that onResponse will be called when Konductor
    // sends a well-formed response even if that response contains
    // error objects. This is because even when there are error objects
    // there can be "handle" payloads to act upon. Also document
    // that onRequestFailure will be called when the network request
    // itself failed (e.g., no internet connection), when JAG throws an
    // error (the request never made it to Konductor), or when
    // Konductor returns a malformed response.
    return lifecycle.onResponse({ response, requestId }).then(() => response);
  };

  const { edgeDomain, edgeBasePath, configId } = config;

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
     * @param {Object} [options]
     * @param {boolean} [options.expectsResponse=true] The endpoint and request mechanism
     * will be determined by whether a response is expected.
     * @param {boolean} [options.documentUnloading=false] This determines the network transport method.
     * When the document is unloading, sendBeacon is used, otherwise fetch is used.
     * @returns {Promise} a promise resolved with the response object once the response is
     * completely processed.  If expectsResponse==false, the promise will be resolved
     * with undefined.
     */
    sendRequest(payload, options = {}) {
      const {
        expectsResponse = true,
        documentUnloading = false,
        useIdThirdPartyDomain = false
      } = options;
      const requestId = uuid();
      if (documentUnloading) {
        logger.log(`No response requested due to document unloading.`);
      }
      const reallyExpectsResponse = documentUnloading ? false : expectsResponse;
      return Promise.resolve()
        .then(() => {
          const action = reallyExpectsResponse ? "interact" : "collect";
          const domain = useIdThirdPartyDomain
            ? ID_THIRD_PARTY_DOMAIN
            : edgeDomain;

          let baseUrl = `https://${domain}`;

          // #if _DEV
          if (config.localEdge) {
            baseUrl = `http://localhost:8080`;
          }
          // #endif

          const url = `${baseUrl}/${edgeBasePath}/${apiVersion}/${action}?configId=${configId}&requestId=${requestId}`;
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

          const executeRequest = (retriesAttempted = 0) => {
            return networkStrategy(
              url,
              stringifiedPayload,
              documentUnloading
            ).then(result => {
              // Will be the case when using sendBeacon.
              if (!result) {
                return undefined;
              }

              const statusType = getResponseStatusType(result.status);

              if (statusType === SUCCESS) {
                return result.body;
              }

              if (statusType === RETRYABLE_ERROR && retriesAttempted < 3) {
                return executeRequest(retriesAttempted + 1);
              }

              throw new Error(
                `Unexpected response status code ${result.status}. Response was: ${result.body}`
              );
            });
          };

          return executeRequest();
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
          return lifecycle
            .onRequestFailure({ requestId })
            .then(throwError, throwError);
        });
    }
  };
};

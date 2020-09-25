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

import { stackError } from "../../utils";

export default ({ logger, networkStrategy, isRetryableHttpStatusCode }) => {
  /**
   * Send a network request and returns details about the response.
   *
   * @param {Object} payload This will be JSON stringified and sent as the post body.
   * @param {String} url The URL to which the request should be sent.
   * @param {String} requestID A unique ID for the request.
   */
  return ({ payload, url, requestId }) => {
    const stringifiedPayload = JSON.stringify(payload);

    // We want to log raw payload and event data rather than
    // our fancy wrapper objects. Calling payload.toJSON() is
    // insufficient to get all the nested raw data, because it's
    // not recursive (it doesn't call toJSON() on the event objects).
    // Parsing the result of JSON.stringify(), however, gives the
    // fully recursive raw data.
    // JSON.parse is expensive so we short circuit if logging is disabled.
    if (logger.enabled) {
      logger.logOnBeforeNetworkRequest({
        url,
        requestId,
        payload: JSON.parse(stringifiedPayload)
      });
    }

    const executeRequest = (retriesAttempted = 0) => {
      return networkStrategy({
        url,
        body: stringifiedPayload,
        documentMayUnload: payload.getDocumentMayUnload()
      }).then(response => {
        if (
          isRetryableHttpStatusCode(response.status) &&
          retriesAttempted < 3
        ) {
          return executeRequest(retriesAttempted + 1);
        }

        let parsedBody;

        try {
          parsedBody = JSON.parse(response.body);
        } catch (e) {
          // Non-JSON. Something went wrong.
        }

        logger.logOnNetworkResponse({
          requestId,
          url,
          payload: JSON.parse(stringifiedPayload),
          ...response,
          parsedBody,
          retriesAttempted
        });

        return {
          statusCode: response.status,
          body: response.body,
          parsedBody
        };
      });
    };

    return executeRequest().catch(error => {
      logger.logOnNetworkError({
        requestId,
        url,
        payload: JSON.parse(stringifiedPayload),
        error
      });
      throw stackError("Network request failed.", error);
    });
  };
};

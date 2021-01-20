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

import { stackError } from "../../utils/index";

export default ({
  logger,
  sendFetchRequest,
  sendBeaconRequest,
  isRetryableHttpStatusCode
}) => {
  /**
   * Send a network request and returns details about the response.
   */
  return ({ requestId, url, payload, useSendBeacon }) => {
    // We want to log raw payload and event data rather than
    // our fancy wrapper objects. Calling payload.toJSON() is
    // insufficient to get all the nested raw data, because it's
    // not recursive (it doesn't call toJSON() on the event objects).
    // Parsing the result of JSON.stringify(), however, gives the
    // fully recursive raw data.
    const stringifiedPayload = JSON.stringify(payload);
    const parsedPayload = JSON.parse(stringifiedPayload);

    logger.logOnBeforeNetworkRequest({
      url,
      requestId,
      payload: parsedPayload
    });

    const executeRequest = (retriesAttempted = 0) => {
      const requestMethod = useSendBeacon
        ? sendBeaconRequest
        : sendFetchRequest;

      return requestMethod(url, stringifiedPayload).then(response => {
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
          payload: parsedPayload,
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
        payload: parsedPayload,
        error
      });
      throw stackError({ error, message: "Network request failed." });
    });
  };
};

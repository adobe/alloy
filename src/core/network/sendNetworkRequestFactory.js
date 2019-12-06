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

import getResponseStatusType from "./getResponseStatusType";
import { stackError } from "../../utils";
import { RETRYABLE_ERROR, SUCCESS } from "../../constants/responseStatusType";

export default ({ logger, networkStrategy }) => {
  /**
   * Send the request to either interact or collect based on expectsResponse.
   * When the response is returned it will call the lifecycle method "onResponse"
   * with the returned response object.
   *
   * @param {Object} payload This will be JSON stringified and sent as the post body.
   * @param {String} endpointDomain The domain of the endpoint to which the
   * request should be sent.
   * @param {String} action The server action which should be triggered (passed
   * as part of the URL).
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
      logger.log(
        `Request ${requestId}: Sending request.`,
        JSON.parse(stringifiedPayload)
      );
    }

    const executeRequest = (retriesAttempted = 0) => {
      return networkStrategy(url, stringifiedPayload).then(response => {
        const statusType = getResponseStatusType(response.status);

        if (statusType === RETRYABLE_ERROR && retriesAttempted < 3) {
          return executeRequest(retriesAttempted + 1);
        }

        let parsedBody;

        try {
          parsedBody = JSON.parse(response.body);
        } catch (e) {
          // Non-JSON. Something went wrong.
        }

        const messagesSuffix =
          parsedBody || response.body ? `response body:` : `no response body.`;

        logger.log(
          `Request ${requestId}: Received response with status code ${response.status} and ${messagesSuffix}`,
          parsedBody || response.body
        );

        return {
          // Every response with a successful status code that has a body
          // must be a parsable body. If it isn't, it's an unexpected
          // body and we should consider it a failure.
          success: Boolean(
            statusType === SUCCESS && (!response.body || parsedBody)
          ),
          statusCode: response.status,
          body: response.body,
          parsedBody
        };
      });
    };

    return executeRequest().catch(error => {
      throw stackError("Network request failed.", error);
    });
  };
};

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

export default (config, logger, lifecycle, networkStrategy) => {
  const handleResponse = responseBody => {
    let parsedBody;

    try {
      parsedBody = JSON.parse(responseBody);
    } catch (e) {
      throw new Error(
        `Error parsing server response.\n${e}\nResponse body: ${responseBody}`
      );
    }

    logger.log("Received network response:", parsedBody);

    const response = createResponse(parsedBody);

    return lifecycle.onResponse(response).then(() => response);
  };

  const { edgeDomain, propertyID } = config;

  return {
    /**
     * The object returned from network.newRequest
     *
     * @typedef {Object} Request
     * @property {Function} send Call this function when you are ready to send
     * the payload. Returns a promise yielding the raw response body.
     * @property {Object} payload Payload object that will be sent.
     */
    /**
     * Create a new request.  Once "send" on the returned object is called, the
     * lifecycle method "onBeforeSend" will be triggered with
     * { payload, responsePromise, isBeacon } as the parameter.  When the
     * response is returned it will call the lifecycle method "onResponse"
     * with the returned response object.
     *
     * @param {boolean} [expectsResponse=true] The endpoint and request mechanism
     * will be determined by whether a response is expected.
     * @returns {Request}
     */
    newRequest(expectsResponse = true) {
      const payload = createPayload();

      const send = () => {
        const responsePromise = Promise.resolve()
          .then(() =>
            lifecycle.onBeforeSend({
              payload,
              responsePromise,
              isBeacon: !expectsResponse
            })
          )
          .then(() => {
            const action = expectsResponse ? "interact" : "collect";
            const url = `https://${edgeDomain}/${action}?propertyID=${propertyID}`;
            const responseHandlingMessage = expectsResponse
              ? ""
              : " (response will be ignored)";
            logger.log(
              `Sending network request${responseHandlingMessage}:`,
              payload.toJSON()
            );

            return networkStrategy(
              url,
              JSON.stringify(payload),
              expectsResponse
            );
          })
          .then(responseBody => {
            let handleResponsePromise;

            if (expectsResponse) {
              handleResponsePromise = handleResponse(responseBody);
            }

            return handleResponsePromise;
          });

        return responsePromise;
      };

      return { payload, send };
    }
  };
};

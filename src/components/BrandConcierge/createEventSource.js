/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {noop, stackError} from "../../utils/index.js";
import createStreamParser from "./createStreamParser.js";

export default ({ logger, isRequestRetryable, getRequestRetryDelay, fetch }) => {
  return async ({ requestId, url, request,  onStreamResponseCallback = noop, onFailureCallback = noop }) => {

    const payload = request.getPayload();
    const stringifiedPayload = JSON.stringify(payload);
    const parsedPayload = JSON.parse(stringifiedPayload);

    logger.logOnBeforeNetworkRequest({
      url,
      requestId,
      payload: parsedPayload,
    });

    const executeRequest = async (retriesAttempted = 0) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "Accept": "text/event-stream",
          },
          body: stringifiedPayload,
        }).then(response => {
          if (!response.ok) {
            const requestIsRetryable = isRequestRetryable({
              response,
              retriesAttempted,
            });

            if (requestIsRetryable) {
              const requestRetryDelay = getRequestRetryDelay({
                response,
                retriesAttempted,
              });
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve(executeRequest(retriesAttempted + 1));
                }, requestRetryDelay);
              });
            }

            throw new Error(`Request failed with status ${response.status}`);
          }


          const parser = createStreamParser();
          const onComplete = (e) => {
            console.log("oncomplete event, e", e);
          };

          parser.parseStream(response.body, onStreamResponseCallback, onFailureCallback, onComplete);

        });



       /* const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          logger.logOnNetworkResponse({
            requestId,
            url,
            payload: parsedPayload,
            response: value,
            retriesAttempted,
          });

          console.log("Stream value chunk", value);

          onStreamResponseCallback(value);*/

      } catch (error) {
        logger.logOnNetworkError({
          requestId,
          url,
          payload: parsedPayload,
          error,
        });
        onFailureCallback(error);
        throw stackError({ error, message: "Network request failed." });
      }
    };

    return executeRequest();
  };
};
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
import { stackError } from "../../utils/index.js";
export default ({ logger, fetch }) => {
  return async ({ requestId, url, request, streamingEnabled = true }) => {
    const payload = request.getPayload();
    const stringifiedPayload = JSON.stringify(payload);
    const parsedPayload = JSON.parse(stringifiedPayload);

    const headers = { "Content-Type": "text/plain" };
    if (streamingEnabled) {
      headers.Accept = "text/event-stream";
    } else {
      headers.Accept = "text/plain";
    }

    logger.logOnBeforeNetworkRequest({
      url,
      requestId,
      payload: parsedPayload,
    });

    const fetchWithRetries = async (attemptNumber = 1) => {
      const maxAttempts = 4;
      const retryDelays = [2000, 3000, 5000];

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: stringifiedPayload,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return response;
      } catch (error) {
        if (attemptNumber < maxAttempts) {
          const delay = retryDelays[attemptNumber - 1];
          logger.logOnNetworkError({
            requestId,
            url,
            payload: parsedPayload,
            error: new Error(
              `Attempt ${attemptNumber} failed, retrying in ${delay}ms: ${error.message}`,
            ),
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetries(attemptNumber + 1);
        }
        logger.logOnNetworkError({
          requestId,
          url,
          payload: parsedPayload,
          error,
        });
        throw stackError({
          error,
          message: "Network request failed after all retries.",
        });
      }
    };
    const executeRequest = async () => {
      return fetchWithRetries();
    };

    return executeRequest();
  };
};

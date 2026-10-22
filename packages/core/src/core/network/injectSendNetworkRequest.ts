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

import { stackError } from "../../utils/index.js";
import type {
  NetworkResponse,
  SendBeaconRequest,
  SendFetchRequest,
} from "../../services/types.js";
import type { Logger } from "../types.js";
import type { IsRequestRetryableOptions } from "./isRequestRetryable.js";
import type { GetRequestRetryDelayOptions } from "./getRequestRetryDelay.js";

export interface InjectSendNetworkRequestDependencies {
  logger: Logger;
  sendFetchRequest: SendFetchRequest;
  sendBeaconRequest: SendBeaconRequest;
  isRequestRetryable: (options: IsRequestRetryableOptions) => boolean;
  getRequestRetryDelay: (options: GetRequestRetryDelayOptions) => number;
}

export interface SendNetworkRequestOptions {
  requestId: string;
  url: string;
  payload: unknown;
  useSendBeacon?: boolean;
  useKeepalive?: boolean;
  headers?: Record<string, string>;
}

export interface SendNetworkRequestResult {
  statusCode: number;
  body: string;
  parsedBody: unknown;
  getHeader: NetworkResponse["getHeader"];
}

export type SendNetworkRequest = (
  options: SendNetworkRequestOptions,
) => Promise<SendNetworkRequestResult>;

export default ({
  logger,
  sendFetchRequest,
  sendBeaconRequest,
  isRequestRetryable,
  getRequestRetryDelay,
}: InjectSendNetworkRequestDependencies): SendNetworkRequest => {
  /**
   * Send a network request and returns details about the response.
   */
  return ({
    requestId,
    url,
    payload,
    useSendBeacon,
    useKeepalive,
    headers,
  }: SendNetworkRequestOptions): Promise<SendNetworkRequestResult> => {
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
      payload: parsedPayload,
    });

    const executeRequest = (
      retriesAttempted = 0,
    ): Promise<SendNetworkRequestResult> => {
      // navigator.sendBeacon() has no way to attach custom headers, so a
      // request that needs any (e.g. authenticated Server API requests)
      // must always go through fetch, regardless of useSendBeacon.
      const request =
        useSendBeacon && !headers
          ? sendBeaconRequest(url, stringifiedPayload)
          : sendFetchRequest(url, stringifiedPayload, headers, {
              keepalive: Boolean(useKeepalive),
            });

      return request.then((response) => {
        const requestIsRetryable = isRequestRetryable({
          response,
          retriesAttempted,
        });

        if (requestIsRetryable) {
          const requestRetryDelay = getRequestRetryDelay({
            response,
            retriesAttempted,
          });
          return new Promise<SendNetworkRequestResult>((resolve) => {
            setTimeout(() => {
              resolve(executeRequest(retriesAttempted + 1));
            }, requestRetryDelay);
          });
        }

        let parsedBody: unknown;

        try {
          parsedBody = JSON.parse(response.body);
        } catch {
          // Non-JSON. Something went wrong.
        }

        logger.logOnNetworkResponse({
          requestId,
          url,
          payload: parsedPayload,
          ...response,
          parsedBody,
          retriesAttempted,
        });

        return {
          statusCode: response.statusCode,
          body: response.body,
          parsedBody,
          getHeader: response.getHeader,
        };
      });
    };

    return executeRequest().catch((error) => {
      logger.logOnNetworkError({
        requestId,
        url,
        payload: parsedPayload,
        error,
      });
      throw stackError({ error, message: "Network request failed." });
    });
  };
};

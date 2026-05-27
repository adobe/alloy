/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import getBaseRequestHeaders from "./getBaseRequestHeaders";
import * as HTTP_STATUS from "../constants/httpStatus";
import * as NETWORK_ERROR_MESSAGE from "../constants/networkErrorMessage";
import UserReportableError from "../errors/userReportableError";

const REACTOR_HOST = "https://reactor.adobe.io";

// JSON:API requires Content-Type for request bodies to be the bare media type
// with no parameters. The Accept header is allowed to include parameters and
// uses Reactor's `;revision=1` selector for response format.
const JSON_API_ACCEPT = "application/vnd.api+json;revision=1";
const JSON_API_CONTENT_TYPE = "application/vnd.api+json";

/**
 * Makes an authenticated request to the Reactor API. Handles header
 * construction, body serialization, abort signal propagation, common
 * status-code mapping, and JSON body parsing.
 *
 * Defaults to GET. To mutate, pass `method: "PATCH"` (etc.) along with a
 * `body`. Sibling helpers (e.g. `updateRuleComponent`) wrap this with verb-
 * specific shapes so call sites document the operation by name.
 *
 * @param {object} options
 * @param {string} options.orgId
 * @param {string} options.imsAccess
 * @param {string} options.path - Request path beneath the Reactor host.
 * @param {string} [options.method="GET"] - HTTP method.
 * @param {URLSearchParams|undefined} [options.params] - Query parameters.
 * @param {object|string|undefined} [options.body] - Request body. Objects are
 *   JSON-stringified; strings are sent as-is.
 * @param {object|undefined} [options.headers] - Additional headers; merged
 *   over the defaults.
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{status: number, parsedBody: object|null}>}
 *   `parsedBody` is `null` for empty / 204 responses.
 */
export default async ({
  orgId,
  imsAccess,
  path,
  method = "GET",
  params,
  body,
  headers,
  signal,
}) => {
  const baseRequestHeaders = getBaseRequestHeaders({ orgId, imsAccess });
  const queryString = params ? `?${params.toString()}` : "";

  const requestHeaders = {
    ...baseRequestHeaders,
    Accept: JSON_API_ACCEPT,
    ...(body !== undefined ? { "Content-Type": JSON_API_CONTENT_TYPE } : {}),
    ...headers,
  };

  const fetchOptions = {
    method,
    headers: requestHeaders,
    signal,
  };
  if (body !== undefined) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(
      `${REACTOR_HOST}${path}${queryString}`,
      fetchOptions,
    );
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError(
      NETWORK_ERROR_MESSAGE.UNABLE_TO_CONNECT_TO_SERVER,
    );
  }

  if (response.status === HTTP_STATUS.NOT_FOUND) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.RESOURCE_NOT_FOUND);
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.INVALID_ACCESS_TOKEN);
  }

  if (response.status === HTTP_STATUS.FORBIDDEN) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.FORBIDDEN_ACCESS);
  }

  let parsedBody = null;
  if (response.status !== HTTP_STATUS.NO_CONTENT) {
    try {
      parsedBody = await response.json();
    } catch (e) {
      if (e.name === "AbortError") {
        throw e;
      }
      throw new UserReportableError(
        NETWORK_ERROR_MESSAGE.UNEXPECTED_SERVER_RESPONSE,
      );
    }
  }

  if (!response.ok) {
    throw new UserReportableError(
      NETWORK_ERROR_MESSAGE.UNEXPECTED_SERVER_RESPONSE,
    );
  }

  return {
    status: response.status,
    parsedBody,
  };
};

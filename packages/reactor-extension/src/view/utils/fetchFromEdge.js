/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import getBaseRequestHeaders from "./getBaseRequestHeaders";
import UserReportableError from "../errors/userReportableError";
import * as HTTP_STATUS from "../constants/httpStatus";
import * as NETWORK_ERROR_MESSAGE from "../constants/networkErrorMessage";
import getHost from "./getHost";

const EDGE_HOST_PROD = "https://edge.adobe.io";
const EDGE_HOST_STAGING = "https://edge-stage.adobe.io";

const ERROR_TYPE_INVALID_ACCESS_TOKEN =
  "https://ns.adobe.com/aep/errors/EXEG-3032-401";
const ERROR_TYPE_FORBIDDEN_ACCESS =
  "https://ns.adobe.com/aep/errors/EXEG-3050-403";
export default async ({ orgId, imsAccess, path, params, headers, signal }) => {
  const host = getHost({
    imsAccess,
    productionHost: EDGE_HOST_PROD,
    stagingHost: EDGE_HOST_STAGING,
  });
  const baseRequestHeaders = getBaseRequestHeaders({ orgId, imsAccess });
  const queryString = params ? `?${params.toString()}` : "";
  let response;

  try {
    response = await fetch(`${host}${path}${queryString}`, {
      headers: {
        ...baseRequestHeaders,
        ...headers,
      },
      signal,
    });
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

  let parsedBody;

  // Be aware that this can throw an error not only if the response
  // body is invalid JSON but also if the request has been aborted.
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

  if (
    response.status === HTTP_STATUS.UNAUTHORIZED &&
    parsedBody.type === ERROR_TYPE_INVALID_ACCESS_TOKEN
  ) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.INVALID_ACCESS_TOKEN);
  }

  if (
    response.status === HTTP_STATUS.FORBIDDEN &&
    parsedBody.type === ERROR_TYPE_FORBIDDEN_ACCESS
  ) {
    throw new UserReportableError(NETWORK_ERROR_MESSAGE.FORBIDDEN_ACCESS);
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

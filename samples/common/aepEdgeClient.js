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
const { uuid } = require("@adobe/target-tools");
const fetch = require("node-fetch");
const { isNotBlank } = require("@adobe/target-tools");

const PAGE_WIDE_SCOPE = "__view__";
const AEP_COOKIE_PREFIX = "kndctr";

const TYPE_STATE_STORE = "state:store";
const TYPE_IDENTITY_RESULT = "identity:result";
const TYPE_PERSONALIZATION = "personalization:decisions";
const TYPE_LOCATION_HINT = "locationHint:result";

const COOKIE_NAME_AEP_EDGE_CLUSTER = "cluster";

const EXP_EDGE_BASE_PATH_PROD = "ee";
const EXP_EDGE_BASE_PATH_STAGE = "ee-pre-prd";

const CLUSTER_HINT_EDGE = "EdgeNetwork";
const CLUSTER_HINT_AAM = "AAM";
const CLUSTER_HINT_TARGET = "Targer";

let DEFAULT_REQUEST_HEADERS = {
  accept: "*/*",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "content-type": "text/plain; charset=UTF-8",
  pragma: "no-cache",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "sec-gpc": "1",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const AEP_EDGE_DOMAIN = "edge.adobedc.net";

const SCHEMAS_PERSONALIZATION = [
  "https://ns.adobe.com/personalization/default-content-item",
  "https://ns.adobe.com/personalization/html-content-item",
  "https://ns.adobe.com/personalization/json-content-item",
  "https://ns.adobe.com/personalization/redirect-item",
  "https://ns.adobe.com/personalization/dom-action",
];

function convertHeadersToSimpleJson(res) {
  const headersPromise = new Promise((resolve) => {
    const result = {};
    for (const pair of res.headers.entries()) {
      result[pair[0]] = pair[1];
    }
    resolve(result);
  });

  return Promise.all([headersPromise, res.json()]);
}

function prepareAepResponse(requestHeaders, requestBody) {
  return ([responseHeaders, responseBody]) => ({
    request: {
      headers: requestHeaders,
      body: requestBody,
    },
    response: {
      headers: responseHeaders,
      body: responseBody,
    },
  });
}

function logResult(message) {
  return (result) => {
    console.log(message, JSON.stringify(result, null, 2));
    return result;
  };
}

function extractEdgeCluster([responseHeaders, responseBody], aepEdgeCluster) {
  const locationHintHandle = responseBody.handle.find(
    (item) => item.type === TYPE_LOCATION_HINT
  );

  if (!locationHintHandle) {
    return aepEdgeCluster;
  }

  const { payload = [] } = locationHintHandle;
  const edgeHint = payload.find((item) => item.scope === CLUSTER_HINT_EDGE);

  if (!edgeHint) {
    return aepEdgeCluster;
  }

  return edgeHint.hint;
}

/**
 *
 * @param {string} edgeConfigId
 * @param {string} aepEdgeCluster cluster hint
 * @param {string} edgeBasePath
 */
function createAepEdgeClient(
  edgeConfigId,
  aepEdgeCluster = "",
  edgeBasePath = EXP_EDGE_BASE_PATH_PROD
) {
  function interact(requestBody, requestHeaders = {}) {
    const requestId = uuid();

    const requestUrl = [
      `https://${AEP_EDGE_DOMAIN}`,
      edgeBasePath,
      aepEdgeCluster,
      "v2",
      `interact?dataStreamId=${edgeConfigId}&requestId=${requestId}`,
    ]
      .filter(isNotBlank)
      .join("/");

    const headers = {
      ...DEFAULT_REQUEST_HEADERS,
      ...requestHeaders,
    };

    return fetch(requestUrl, {
      headers,
      body: JSON.stringify(requestBody),
      method: "POST",
    })
      .then(convertHeadersToSimpleJson)
      .then((response) => {
        aepEdgeCluster = extractEdgeCluster(response, aepEdgeCluster);
        return response;
      })
      .then(prepareAepResponse(headers, requestBody))
      .then(logResult(`AEP EDGE REQUEST: ${requestUrl}`));
  }

  function getPropositions({
    decisionScopes = [PAGE_WIDE_SCOPE],
    xdm = {},
    data = {},
    meta = {},
    requestHeaders = {},
  }) {
    const requestBody = {
      event: {
        xdm: {
          ...xdm,
          timestamp: new Date().toISOString(),
        },
        data: {
          ...data,
        },
      },
      query: {
        identity: { fetch: ["ECID"] },
        personalization: {
          schemas: SCHEMAS_PERSONALIZATION,
          decisionScopes,
        },
      },
      meta: {
        ...meta,
      },
    };

    return interact(requestBody, requestHeaders);
  }

  return {
    interact,
    getPropositions,
  };
}

function getAepCookieName(organizationId, name) {
  return [AEP_COOKIE_PREFIX, organizationId.replace("@", "_"), name].join("_");
}

function getAepEdgeClusterCookie(organizationId, req) {
  const cookieName = getAepCookieName(
    organizationId,
    COOKIE_NAME_AEP_EDGE_CLUSTER
  );

  return req.cookies[cookieName];
}

function createIdentityPayload(
  id,
  authenticatedState = "ambiguous",
  primary = true
) {
  if (id.length === 0) {
    return undefined;
  }

  return {
    id,
    authenticatedState,
    primary,
  };
}

function getResponseHandles(aepEdgeResult) {
  const { response = {} } = aepEdgeResult;
  const { body = {} } = response;
  const { handle: handles = [] } = body;
  return handles;
}

module.exports = {
  getAepCookieName,
  getAepEdgeClusterCookie,
  createAepEdgeClient,
  AEP_COOKIE_PREFIX,
  PAGE_WIDE_SCOPE,
  COOKIE_NAME_AEP_EDGE_PATH: COOKIE_NAME_AEP_EDGE_CLUSTER,
  TYPE_PERSONALIZATION,
  TYPE_STATE_STORE,
  TYPE_IDENTITY_RESULT,
  AEP_EDGE_BASE_URL: AEP_EDGE_DOMAIN,
  EXP_EDGE_BASE_PATH_PROD,
  EXP_EDGE_BASE_PATH_STAGE,
  createIdentityPayload,
  getResponseHandles,
};

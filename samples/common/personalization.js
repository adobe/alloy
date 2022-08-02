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
const { PAGE_WIDE_SCOPE, TYPE_PERSONALIZATION } = require("./aepEdgeClient");

const { getAddress } = require("./utils");

/**
 * Requests propositions from the Adobe Experience Edge API
 * @param aepEdgeClient instance of aepEdgeClient
 * @param req request object
 * @param decisionScopes array of decision scopes to retrieve (global page-wide scope included by default)
 * @param identityMap object with identities
 * @param cookieEntries
 * @returns {Promise<*>}
 */
function requestAepEdgePersonalization(
  aepEdgeClient,
  req,
  decisionScopes = [],
  identityMap = {},
  cookieEntries = []
) {
  const address = getAddress(req);

  return aepEdgeClient.getPropositions({
    decisionScopes: [PAGE_WIDE_SCOPE, ...decisionScopes],
    xdm: {
      web: {
        webPageDetails: { URL: address },
        webReferrer: { URL: "" },
      },
      identityMap: {
        ...identityMap,
      },
    },
    meta: {
      state: {
        domain: req.headers.host,
        cookiesEnabled: true,
        entries: cookieEntries,
      },
    },
    requestHeaders: {
      Referer: address,
    },
  });
}

/**
 *
 * @param aepEdgeClient
 * @param req
 * @param propositions
 * @param cookieEntries
 */
function sendDisplayEvent(aepEdgeClient, req, propositions, cookieEntries) {
  const address = getAddress(req);

  aepEdgeClient.interact(
    {
      event: {
        xdm: {
          web: {
            webPageDetails: { URL: address },
            webReferrer: { URL: "" },
          },
          timestamp: new Date().toISOString(),
          eventType: "decisioning.propositionDisplay",
          _experience: {
            decisioning: {
              propositions: propositions.map((proposition) => {
                const { id, scope, scopeDetails } = proposition;

                return {
                  id,
                  scope,
                  scopeDetails,
                };
              }),
            },
          },
        },
      },
      query: { identity: { fetch: ["ECID"] } },
      meta: {
        state: {
          domain: "",
          cookiesEnabled: true,
          entries: [...cookieEntries],
        },
      },
    },
    {
      Referer: address,
    }
  );
}

function getPersonalizationPayloads(aepEdgeResult) {
  const { response = {} } = aepEdgeResult;
  const { body = {} } = response;
  const { handle: aepEdgeHandles = [] } = body;

  const personalization =
    aepEdgeHandles.find((handle) => handle.type === TYPE_PERSONALIZATION) || {};

  const { payload: payloadList = [] } = personalization;
  return payloadList;
}

function getPersonalizationOffer(aepEdgeResult, decisionScopeName) {
  return (
    getPersonalizationPayloads(aepEdgeResult).find(
      (payload) => payload.scope === decisionScopeName
    ) || {}
  );
}

module.exports = {
  requestAepEdgePersonalization,
  getPersonalizationPayloads,
  getPersonalizationOffer,
  sendDisplayEvent,
};

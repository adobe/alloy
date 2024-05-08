/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { assign } from "../../utils/index.js";
import getIdentityOptionsValidator from "./getIdentity/getIdentityOptionsValidator.js";
import appendIdentityToUrlOptionsValidator from "./appendIdentityToUrl/appendIdentityToUrlOptionsValidator.js";

export default ({
  addEcidQueryToPayload,
  addQueryStringIdentityToPayload,
  ensureSingleIdentity,
  setLegacyEcid,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  getIdentity,
  consent,
  appendIdentityToUrl,
  logger
}) => {
  let ecid;
  let edge = {};
  return {
    lifecycle: {
      onBeforeRequest({ request, onResponse, onRequestFailure }) {
        // Querying the ECID on every request to be able to set the legacy cookie, and make it
        // available for the `getIdentity` command.
        addEcidQueryToPayload(request.getPayload());
        addQueryStringIdentityToPayload(request.getPayload());
        return ensureSingleIdentity({ request, onResponse, onRequestFailure });
      },
      onResponse({ response }) {
        if (!ecid) {
          ecid = getEcidFromResponse(response);

          // Only data collection calls will have an ECID in the response.
          // https://jira.corp.adobe.com/browse/EXEG-1234
          if (ecid) {
            setLegacyEcid(ecid);
          }
        }
        // For sendBeacon requests, getEdge() will return {}, so we are using assign here
        // so that sendBeacon requests don't override the edge info from before.
        edge = assign(edge, response.getEdge());

        return handleResponseForIdSyncs(response);
      }
    },
    commands: {
      getIdentity: {
        optionsValidator: getIdentityOptionsValidator,
        run: options => {
          return consent
            .awaitConsent()
            .then(() => {
              return ecid ? undefined : getIdentity(options);
            })
            .then(() => {
              return {
                identity: {
                  ECID: ecid
                },
                edge
              };
            });
        }
      },
      appendIdentityToUrl: {
        optionsValidator: appendIdentityToUrlOptionsValidator,
        run: options => {
          return consent
            .withConsent()
            .then(() => {
              return ecid ? undefined : getIdentity(options);
            })
            .then(() => {
              return { url: appendIdentityToUrl(ecid, options.url) };
            })
            .catch(error => {
              logger.warn(`Unable to append identity to url. ${error.message}`);
              return options;
            });
        }
      }
    }
  };
};

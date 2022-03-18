import { assign } from "../../utils";
import getIdentityOptionsValidator from "./getIdentity/getIdentityOptionsValidator";

export default ({
  addEcidQueryToPayload,
  addQueryStringIdentityToPayload,
  ensureSingleIdentity,
  setLegacyEcid,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  getIdentity,
  consent
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
              return ecid ? undefined : getIdentity(options.namespaces);
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
      }
    }
  };
};

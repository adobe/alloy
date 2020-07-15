import getIdentityOptionsValidator from "./getIdentity/getIdentityOptionsValidator";

export default ({
  addEcidQueryToPayload,
  ensureSingleIdentity,
  setLegacyEcid,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  getIdentity,
  consent
}) => {
  let ecid;
  return {
    lifecycle: {
      onBeforeRequest({ payload, onResponse }) {
        // Querying the ECID on every request to be able to set the legacy cookie, and make it
        // available for the `getIdentity` command.
        addEcidQueryToPayload(payload);
        return ensureSingleIdentity({ payload, onResponse });
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
                }
              };
            });
        }
      }
    }
  };
};

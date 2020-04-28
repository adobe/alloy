import getIdentityOptionsValidator from "./getIdentity/getIdentityOptionsValidator";

export default ({
  addEcidQueryToEvent,
  identityManager,
  ensureRequestHasIdentity,
  setLegacyEcid,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  getIdentity,
  consent,
  validateSyncIdentityOptions
}) => {
  let ecid;
  return {
    lifecycle: {
      // TODO: It would probably be best to query on the data collection payload level
      // rather than the event. It seems like a payload-level thing and would save
      // space whenever we start supporting multiple events per payload.
      onBeforeEvent({ event }) {
        addEcidQueryToEvent(event);
      },
      onBeforeRequest({ payload, onResponse }) {
        identityManager.addToPayload(payload);
        return ensureRequestHasIdentity({ payload, onResponse });
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
      syncIdentity: {
        optionsValidator: validateSyncIdentityOptions,
        run: options => {
          return identityManager.sync(options.identities);
        }
      },
      getIdentity: {
        optionsValidator: getIdentityOptionsValidator,
        run: options => {
          return consent.awaitConsent().then(() => {
            if (ecid) {
              return { "ECID": ecid };
            }
            return getIdentity(options.namespaces).then(() => {
              return { "ECID": ecid };
            });
          });
        }
      }
    }
  };
};

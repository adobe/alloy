export default ({
  addEcidQueryToEvent,
  customerIds,
  ensureRequestHasIdentity,
  setLegacyEcid,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  getEcid,
  consent
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
        customerIds.addToPayload(payload);
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
      setCustomerIds: {
        run: options => {
          return customerIds.sync(options);
        }
      },
      getEcid: {
        run() {
          return consent.awaitConsent().then(() => {
            if (ecid) {
              return ecid;
            }
            return getEcid().then(() => {
              return ecid;
            });
          });
        }
      }
    }
  };
};

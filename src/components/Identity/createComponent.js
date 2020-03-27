export default ({
  addEcidQueryToEvent,
  customerIds,
  syncRequestWithIdentityRetrieval,
  handleEcidForIdMigration,
  handleResponseForIdSyncs,
  getEcidFromResponse
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
        return syncRequestWithIdentityRetrieval({ payload, onResponse });
      },
      onResponse({ response }) {
        // Only data collection calls will have an ECID in the response.
        ecid = getEcidFromResponse(response);
        return Promise.all([
          handleEcidForIdMigration(ecid),
          handleResponseForIdSyncs(response)
        ]);
      }
    },
    commands: {
      setCustomerIds: customerIds.sync,
      getEcid() {
        if (ecid) {
          return ecid;
        }

        // TODO: Make request for ECID and return the ECID back to the customer.
        // I don't think we'll need to set the local ecid variable because
        // that should be handled in the onResponse lifecycle.
        // If a request has already gone out that may result in an
        // ECID being returned (which only applies to `interact`
        // requests currently--more details here:
        // https://jira.corp.adobe.com/browse/EXEG-1234), that's fine.
        // Rather than trying to coordinate using the ECID from that request's
        // response, we'll just make our own request anyway.
        return undefined;
      }
    }
  };
};

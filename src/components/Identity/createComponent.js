export default ({
  addEcidQueryToEvent,
  customerIds,
  ensureRequestHasIdentity,
  createLegacyIdentityCookie,
  handleResponseForIdSyncs,
  getEcidFromResponse,
  ecidReference
}) => {
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
        if (!ecidReference.value) {
          ecidReference.value = getEcidFromResponse(response);

          // Only data collection calls will have an ECID in the response.
          // https://jira.corp.adobe.com/browse/EXEG-1234
          if (ecidReference.value) {
            createLegacyIdentityCookie(ecidReference.value);
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
          if (ecidReference.value) {
            return ecidReference.value;
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
    }
  };
};

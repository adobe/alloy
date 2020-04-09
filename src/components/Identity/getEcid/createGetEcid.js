import createIdentityPayload from "./createIdentityPayload";

const identityPayload = createIdentityPayload();
export default ({ sendEdgeNetworkRequest, consent }) => {
  return () =>
    consent.awaitConsent().then(() =>
      sendEdgeNetworkRequest({
        payload: identityPayload,
        action: "identity/acquire"
      })
    );
};

import createIdentityPayload from "./createIdentityPayload";
import configurePayload from "../configurePayload";

export default (
  sendEdgeNetworkRequest,
  migration,
  idMigrationEnabled,
  thirdPartyCookiesEnabled,
  consent,
  customerIds
) => {
  const payload = createIdentityPayload();
  payload.addQuery();
  customerIds.addToPayload(payload);
  configurePayload(
    payload,
    migration,
    idMigrationEnabled,
    thirdPartyCookiesEnabled
  );
  return consent.awaitConsent().then(() => {
    return sendEdgeNetworkRequest({
      payload,
      action: "identity/acquire"
    });
  });
};

import getBrowser from "../../utils/getBrowser";
import areThirdPartyCookiesSupportedByDefault from "../../utils/areThirdPartyCookiesSupportedByDefault";
import ecidNamespace from "../../constants/ecidNamespace";

const addEcidToPayload = (payload, ecid) => {
  payload.addIdentity(ecidNamespace, {
    id: ecid
  });
};
export default (
  payload,
  migration,
  idMigrationEnabled,
  thirdPartyCookiesEnabled
) => {
  const ecidToMigrate =
    idMigrationEnabled && migration.getEcidFromLegacyCookies();
  if (ecidToMigrate) {
    // We have an ECID, but we still want to establish an
    // identity cookie before allowing other requests to be sent.
    addEcidToPayload(payload, ecidToMigrate);
  }

  if (
    thirdPartyCookiesEnabled &&
    areThirdPartyCookiesSupportedByDefault(getBrowser(window))
  ) {
    // If third-party cookies are enabled by the customer and
    // supported by the browser, we will send the request to a
    // a third-party identification domain that allows for more accurate
    // identification of the user through use of a third-party cookie.
    // If we have an ECID to migrate, we still want to hit the
    // third-party domain because the third-party identification domain
    // will use our ECID to set the third-party cookie if the third-party
    // cookie isn't already set, which provides for better cross-domain
    // identification for future requests.
    payload.useIdThirdPartyDomain();
  }
};

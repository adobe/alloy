import { cookieJar } from "../../utils";
import { EXPERIENCE_CLOUD_ID } from "./constants/cookieNames";

export default (orgId, idMigrationEnabled) => {
  const amcvCookieName = `AMCV_${orgId}`;

  return {
    getEcidFromLegacyCookie(identityCookieJar) {
      let ecid = null;
      const legacyItpCookieName = "s_ecid";

      if (idMigrationEnabled) {
        const legacyEcidCookieValue =
          cookieJar.get(legacyItpCookieName) || cookieJar.get(amcvCookieName);

        if (legacyEcidCookieValue) {
          const reg = /(^|\|)MCMID\|(\d+)($|\|)/;
          const matches = legacyEcidCookieValue.match(reg);
          // Destructuring arrays breaks in IE
          // eslint-disable-next-line prefer-destructuring
          if (matches) {
            ecid = matches[2];
            identityCookieJar.set(EXPERIENCE_CLOUD_ID, ecid);
          }
        }
      }

      return ecid;
    },
    createAmcvCookie(ecid) {
      if (idMigrationEnabled) {
        const amcvCookieValue = cookieJar.get(amcvCookieName);
        if (!amcvCookieValue) {
          cookieJar.set(amcvCookieName, `MCMID|${ecid}`);
        }
      }
    }
  };
};

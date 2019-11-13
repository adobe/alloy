import { cookieJar } from "../../utils";
import { EXPERIENCE_CLOUD_ID } from "./constants/cookieNames";

export default (orgId, idMigrationEnabled) => {
  return {
    getEcidFromAmcvCookie(identityCookieJar) {
      let ecid = null;
      if (idMigrationEnabled) {
        const amcvCookieValue = cookieJar.get(`AMCV_${orgId}`);
        if (amcvCookieValue) {
          const reg = /(^|\|)MCMID\|(\d+)($|\|)/;
          const matches = amcvCookieValue.match(reg);
          // Destructuring arrays breaks in IE
          // eslint-disable-next-line prefer-destructuring
          ecid = matches[2];
          identityCookieJar.set(EXPERIENCE_CLOUD_ID, ecid);
        }
      }
      return ecid;
    },
    createAmcvCookie(ecid) {
      if (idMigrationEnabled) {
        const amcvCookieValue = cookieJar.get(`AMCV_${orgId}`);
        if (!amcvCookieValue) {
          cookieJar.set(`AMCV_${orgId}`, `MCMID|${ecid}`);
        }
      }
    }
  };
};

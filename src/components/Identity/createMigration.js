import { cookieJar } from "../../utils";
import { EXPERIENCE_CLOUD_ID } from "./constants/cookieNames";

export default (imsOrgId, migrateIds) => {
  if (!migrateIds) {
    return {
      getEcidFromAmcvCookie() {},
      createAmcvCookie() {}
    };
  }
  return {
    getEcidFromAmcvCookie(identityCookieJar) {
      const amcvCookieValue = cookieJar.get(`AMCV_${imsOrgId}`);
      let ecid = "";
      if (amcvCookieValue) {
        const reg = /MCMID\|(\d+)\|/;
        [, ecid] = amcvCookieValue.match(reg);
        identityCookieJar.set(EXPERIENCE_CLOUD_ID, ecid);
      }
      return ecid;
    },
    createAmcvCookie(ecid) {
      const amcvCookieValue = cookieJar.get(`AMCV_${imsOrgId}`);
      if (!amcvCookieValue) {
        cookieJar.set(`AMCV_${imsOrgId}`, `MCMID|${ecid}`);
      }
    }
  };
};

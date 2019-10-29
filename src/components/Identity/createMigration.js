import { cookieJar } from "../../utils";

export default (imsOrgId, migrateIds) => {
  if (!migrateIds) {
    return {
      readEcidFromAmcvCookie() {},
      createAmcvCookie() {}
    };
  }
  return {
    readEcidFromAmcvCookie() {
      const amcvCookieValue = cookieJar.get(`AMCV_${imsOrgId}`);
      let ecid = "";
      if (amcvCookieValue) {
        const reg = /MCMID\|(\d+)\|/;
        [, ecid] = amcvCookieValue.match(reg);
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

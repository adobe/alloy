import cookie from "@adobe/reactor-cookie";

export default imsOrgId => {
  return {
    readEcidFromAmcvCookie() {
      const amcvCookieValue = cookie.get(`AMCV_${imsOrgId}`);
      const reg = /(MCMID)\|(\d+)\|/;
      let ecid = "";
      if (amcvCookieValue) {
        amcvCookieValue.replace(reg, (match, mid, value) => {
          ecid = value;
        });
      }
      return ecid;
    },
    createAmcvCookie(ecid) {
      const amcvCookieValue = cookie.get(`AMCV_${imsOrgId}`);
      if (!amcvCookieValue) {
        cookie.set(`AMCV_${imsOrgId}`, `MCMID|${ecid}`);
      }
    }
  };
};

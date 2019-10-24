import cookie from "@adobe/reactor-cookie";

const createAmcvCookie = (ecid, imsOrgId) => {
  const amcvCookieValue = cookie.get(`AMCV_${imsOrgId}`);
  if (!amcvCookieValue) {
    cookie.set(`AMCV_${imsOrgId}`, `MCMID|${ecid}`);
  }
};
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

    getEcidFromDemdex() {
      return fetch(
        `https://dpm.demdex.net/id?imsOrg=${imsOrgId}&ts=${new Date().getTime()}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      ).then(response =>
        response.json().then(data => {
          const ecid = data.id;
          createAmcvCookie(ecid, imsOrgId);
          return ecid;
        })
      );
    }
  };
};

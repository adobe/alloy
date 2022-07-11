const { TYPE_STATE_STORE, AEP_COOKIE_PREFIX } = require("./aepEdgeClient");

/**
 * Sets cookies in the response object
 * @param req request
 * @param res response to be returned to the client
 * @param cookie cookie to be set
 */
function saveCookie(req, res, cookie) {
  if (!cookie) {
    return;
  }

  res.cookie(cookie.name || cookie.key, cookie.value, {
    maxAge: cookie.maxAge * 1000,
    domain: req.headers.host.includes(".")
      ? `.${req.headers.host}`
      : req.headers.host,
  });
}

/**
 * If there are cookies in the set "state:store" handle of the exp edge response, set them on the response object
 * @param organizationId
 * @param req
 * @param res
 * @param aepEdgeResult
 */
function saveAepEdgeCookies(organizationId, { req, res, aepEdgeResult }) {
  const { handle = [] } = aepEdgeResult.response.body;
  handle
    .filter((item) => item.type === TYPE_STATE_STORE)
    .forEach((item) => {
      const { payload = [] } = item;

      payload.forEach((cookie) => {
        saveCookie(req, res, cookie);
      });
    });
}

/**
 *
 * Extracts an array of AEP cookies found in the request headers
 * AEP cookies are prefixed with 'kndctr_'
 * @param req request object
 * @returns {*[]} Array of cookies
 */
function getAepEdgeCookies(req) {
  const entries = [];

  Object.keys(req.cookies)
    .filter((key) => key.startsWith(AEP_COOKIE_PREFIX))
    .forEach((key) => {
      entries.push({
        key,
        value: req.cookies[key],
      });
    });

  return entries;
}

module.exports = {
  saveAepEdgeCookies,
  getAepEdgeCookies,
};

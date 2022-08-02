/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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

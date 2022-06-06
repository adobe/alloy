/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Handles migration of ECID to and from Visitor.js.
 */
export default ({
  config,
  getEcidFromVisitor,
  apexDomain,
  isPageSsl,
  cookieJar
}) => {
  const { idMigrationEnabled, orgId } = config;
  const amcvCookieName = `AMCV_${orgId}`;

  const getEcidFromLegacyCookies = () => {
    let ecid = null;
    const secidCookieName = "s_ecid";

    const legacyEcidCookieValue =
      cookieJar.get(secidCookieName) || cookieJar.get(amcvCookieName);

    if (legacyEcidCookieValue) {
      const reg = /(^|\|)MCMID\|(\d+)($|\|)/;
      const matches = legacyEcidCookieValue.match(reg);

      if (matches) {
        // Destructuring arrays breaks in IE
        ecid = matches[2];
      }
    }

    return ecid;
  };

  return {
    getEcid() {
      if (idMigrationEnabled) {
        const ecid = getEcidFromLegacyCookies();
        if (ecid) {
          return Promise.resolve(ecid);
        }
        return getEcidFromVisitor();
      }
      return Promise.resolve();
    },
    setEcid(ecid) {
      if (idMigrationEnabled && getEcidFromLegacyCookies() !== ecid) {
        const extraOptions = isPageSsl
          ? { sameSite: "none", secure: true }
          : {};

        cookieJar.set(amcvCookieName, `MCMID|${ecid}`, {
          domain: apexDomain,
          // Without `expires` this will be a session cookie.
          expires: 390, // days, or 13 months.
          ...extraOptions
        });
      }
    }
  };
};

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

import { cookieJar } from "../../utils";

const secidCookieName = "s_ecid";

export default orgId => {
  const amcvCookieName = `AMCV_${orgId}`;

  return {
    getEcidFromLegacyCookies() {
      let ecid = null;

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
    },
    createLegacyCookies(ecid) {
      const legacyCookieValue = `MCMID|${ecid}`;
      if (!cookieJar.get(secidCookieName)) {
        cookieJar.set(secidCookieName, legacyCookieValue);
      }
      if (!cookieJar.get(amcvCookieName)) {
        cookieJar.set(amcvCookieName, legacyCookieValue);
      }
    }
  };
};

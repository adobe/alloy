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

import { getApexDomain, cookieJar, isObject, isFunction } from "../../utils";
// TODO: We are already retrieving the apex in core; find a way to reuse it.
// Maybe default the domain in the cookieJar to apex while allowing overrides.
const apexDomain = getApexDomain(window, cookieJar);

export default ({ orgId, consent, logger }) => {
  const amcvCookieName = `AMCV_${orgId}`;
  const Visitor = window.Visitor;
  const doesVisitorExist =
    isFunction(Visitor) && isFunction(Visitor.getInstance);

  const awaitVisitorOptIn = () => {
    return new Promise(resolve => {
      if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
        const optInOld = window.adobe.optIn;
        logger.log(
          "Delaying request while waiting for legacy opt in to let Visitor retrieve ECID from server."
        );
        optInOld.fetchPermissions(() => {
          if (optInOld.isApproved([optInOld.Categories.ECID])) {
            logger.log(
              "Received legacy opt in approval to let Visitor retrieve ECID from server."
            );

            resolve();
          }
        }, true);
      } else {
        resolve();
      }
    });
  };

  const getVisitorECID = () => {
    return awaitVisitorOptIn().then(() => {
      return new Promise(resolve => {
        const visitor = Visitor.getInstance(orgId, {});
        visitor.getMarketingCloudVisitorID(resolve, true);
      });
    });
  };

  return {
    getEcidFromLegacy() {
      const ecid = this.getEcidFromLegacyCookies();

      if (ecid) {
        return new Promise(resolve => {
          resolve(ecid);
        });
      }

      if (doesVisitorExist) {
        return getVisitorECID();
      }
      return new Promise(resolve => {
        resolve();
      });
    },
    getEcidFromLegacyCookies() {
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
    },
    createLegacyCookie(ecid) {
      const amcvCookieValue = cookieJar.get(amcvCookieName);

      if (amcvCookieValue) {
        return Promise.resolve();
      }

      return consent.awaitConsent().then(() => {
        cookieJar.set(amcvCookieName, `MCMID|${ecid}`, {
          domain: apexDomain,
          // Without `expires` this will be a session cookie.
          expires: 390 // days, or 13 months.
        });
      });
    }
  };
};

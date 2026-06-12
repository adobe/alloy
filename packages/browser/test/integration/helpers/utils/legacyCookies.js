/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export const LEGACY_IDENTITY_COOKIE_NAME =
  "AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg";

export const LEGACY_IDENTITY_COOKIE_UNESCAPED_NAME =
  LEGACY_IDENTITY_COOKIE_NAME.replace("%40", "@");

// ECID embedded in the legacy cookie value below
export const LEGACY_ECID = "16908443662402872073525706953453086963";

export const setLegacyIdentityCookie = (orgId = "5BFE274A5F6980A50A495C08@AdobeOrg") => {
  const encodedOrgId = encodeURIComponent(orgId);
  const cookieName = `AMCV_${encodedOrgId}`;
  const cookieValue =
    "77933605%7CMCIDTS%7C18290%7CMCMID%7C16908443662402872073525706953453086963%7CMCAAMLH-1580857889%7C9%7CMCAAMB-1580857889%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1580260289s%7CNONE%7CvVersion%7C4.5.1";
  document.cookie = `${cookieName}=${cookieValue}; path=/`;
};

export const setSecidCookie = () => {
  document.cookie =
    "s_ecid=MCMID%7C16908443662402872073525706953453086963; path=/";
};

export const getCookie = (name) => {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const idx = cookie.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(cookie.slice(0, idx).trim());
    const val = cookie.slice(idx + 1).trim();
    if (key === name || key === decodeURIComponent(name)) {
      return val;
    }
  }
  return undefined;
};

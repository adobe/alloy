/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { getNamespacedCookieName } from "../../utils/index.js";
import { CONSENT } from "../../constants/cookieNameKey.js";
import type { CookieService } from "../../services/types.js";
import type { ConsentByPurpose } from "../../core/consent/types.js";

export interface StoredConsentOptions {
  parseConsentCookie: (cookieValue: string) => ConsentByPurpose;
  orgId: string;
  cookieJar: Pick<CookieService, "get" | "remove">;
}

export interface StoredConsent {
  read: () => Partial<ConsentByPurpose>;
  clear: () => void;
}

export default ({
  parseConsentCookie,
  orgId,
  cookieJar,
}: StoredConsentOptions): StoredConsent => {
  const consentCookieName = getNamespacedCookieName(orgId, CONSENT);

  return {
    read() {
      const cookieValue = cookieJar.get(consentCookieName);
      return cookieValue ? parseConsentCookie(cookieValue) : {};
    },
    clear() {
      cookieJar.remove(consentCookieName);
    },
  };
};

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

import COOKIE_NAME_PREFIX from "../../constants/cookieNamePrefix";

export default ({ cookieJar }) =>
  /**
   * A function that reads all the cookies on the page and extracts the organization ID
   * from every cookie that starts with "kndctr_".
   * @returns {!string[]} an array of organization ID
   */
  () => {
    const allCookies = cookieJar.get();
    const orgIds = Object.keys(allCookies)
      .filter(cookieName => cookieName.includes(COOKIE_NAME_PREFIX))
      .map(cookieName => cookieName.split("_")[1])
      .reduce((orgIdsSet, orgId) => orgIdsSet.add(orgId), new Set());
    // sort for determinism, since cookie order and set order are non-deterministic.
    return Array.from(orgIds).sort();
  };

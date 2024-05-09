/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { ClientFunction, t } from "testcafe";

const blankOutCookieInBrowser = ClientFunction((name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
});

export default {
  clear: ClientFunction(() => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i += 1) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }),
  get: ClientFunction((name) => {
    const cookies = document.cookie
      .split(";")
      .map((c) => {
        const ct = c.trim();
        const index = ct.indexOf("=");
        return [ct.slice(0, index), ct.slice(index + 1)].map(
          decodeURIComponent,
        );
      })
      .reduce((a, b) => {
        try {
          a[b[0]] = JSON.parse(b[1]);
        } catch (e) {
          a[b[0]] = b[1];
        }
        return a;
      }, {});

    return cookies[name] || undefined;
  }),
  async remove(name) {
    // From testing, I noticed that Web SDK no longer has access to the cookies
    // when we use cookies.remove, and the browser no longer has access to the cookies
    // when we use t.deleteCookies. So I call both here.
    await blankOutCookieInBrowser(name);
    await t.deleteCookies(name);
  },
};

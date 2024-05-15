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

import {
  injectDoesIdentityCookieExist,
  cookieJar,
} from "../../../../src/utils/index.js";
import removeAllCookies from "../../helpers/removeAllCookies.js";

describe("Identity::injectDoesIdentityCookieExist", () => {
  beforeEach(removeAllCookies);
  afterEach(removeAllCookies);

  it("returns false if cookie does not exist", () => {
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId: "org@adobe",
    });
    expect(doesIdentityCookieExist()).toBeFalse();
  });

  it("returns true if cookie exists", () => {
    cookieJar.set("kndctr_org_adobe_identity", "user@adobe");
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId: "org@adobe",
    });
    expect(doesIdentityCookieExist()).toBeTrue();
  });
});

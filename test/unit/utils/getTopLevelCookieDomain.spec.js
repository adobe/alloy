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

import getTopLevelCookieDomain from "../../../src/utils/getTopLevelCookieDomain";

const mockWindowWithHostname = hostname => {
  return {
    location: {
      hostname
    }
  };
};

describe("getTld", () => {
  it("returns an empty string when only one host part exists", () => {
    const window = mockWindowWithHostname("localhost");
    const cookie = {
      get() {},
      set() {},
      remove() {}
    };
    expect(getTopLevelCookieDomain(window, cookie)).toBe("");
  });

  it("returns the first host that allows a cookie to be set", () => {
    const window = mockWindowWithHostname("a.b.c.co.uk");
    let storedValue;
    const cookie = {
      get() {
        return storedValue;
      },
      set(name, value, options) {
        if (options.domain === "c.co.uk") {
          storedValue = value;
        }
      },
      remove: jasmine.createSpy()
    };

    expect(getTopLevelCookieDomain(window, cookie)).toBe("c.co.uk");
    expect(cookie.remove).toHaveBeenCalled();
  });
});

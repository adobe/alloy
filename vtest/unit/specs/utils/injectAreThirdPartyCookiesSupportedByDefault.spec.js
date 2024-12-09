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

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectAreThirdPartyCookiesSupportedByDefault from "../../../../src/utils/injectAreThirdPartyCookiesSupportedByDefault.js";
import {
  CHROME,
  EDGE,
  EDGE_CHROMIUM,
  FIREFOX,
  IE,
  SAFARI,
  UNKNOWN,
} from "../../../../src/constants/browser.js";

const browsersWithSupport = [CHROME, EDGE, EDGE_CHROMIUM, IE, UNKNOWN];
const browsersWithoutSupport = [FIREFOX, SAFARI];
describe("areThirdPartyCookiesSupportedByDefault", () => {
  let getBrowser;
  let areThirdPartyCookiesSupportedByDefault;
  beforeEach(() => {
    getBrowser = vi.fn();
    areThirdPartyCookiesSupportedByDefault =
      injectAreThirdPartyCookiesSupportedByDefault({
        getBrowser,
      });
  });
  browsersWithSupport.forEach((browser) => {
    it(`reports true for ${browser}`, () => {
      getBrowser.mockReturnValue(browser);
      expect(areThirdPartyCookiesSupportedByDefault()).toBe(true);
    });
  });
  browsersWithoutSupport.forEach((browser) => {
    it(`reports false for ${browser}`, () => {
      getBrowser.mockReturnValue(browser);
      expect(areThirdPartyCookiesSupportedByDefault()).toBe(false);
    });
  });
});

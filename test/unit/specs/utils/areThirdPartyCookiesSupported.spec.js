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

import areThirdPartyCookiesSupported from "../../../../src/utils/areThirdPartyCookiesSupported";
import {
  CHROME,
  EDGE,
  EDGE_CHROMIUM,
  FIREFOX,
  IE,
  SAFARI,
  UNKNOWN
} from "../../../../src/constants/browser";

const browsersWithSupport = [CHROME, EDGE, EDGE_CHROMIUM, IE, UNKNOWN];
const browsersWithoutSupport = [FIREFOX, SAFARI];

describe("isThirdPartyCookieSupported", () => {
  browsersWithSupport.forEach(browser => {
    it(`reports true for ${browser}`, () => {
      expect(areThirdPartyCookiesSupported(browser)).toBeTrue();
    });
  });

  browsersWithoutSupport.forEach(browser => {
    it(`reports false for ${browser}`, () => {
      expect(areThirdPartyCookiesSupported(browser)).toBeFalse();
    });
  });
});

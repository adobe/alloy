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

import isThirdPartyCookieSupported from "../../../../src/utils/isThirdPartyCookieSupported";

const userAgentsWithSupport = [
  // Chrome
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36",
  // IE
  "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Tablet PC 2.0; rv:11.0) like Gecko",
  "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko",
  // Unknown
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/238.0.0.50.115;FBBV/171859800;FBDV/iPhone9,3;FBMD/iPhone;FBSN/iOS;FBSV/12.4.1;FBSS/2;FBID/phone;FBLC/en_US;FBOP/5;FBRV/172564136;FBCR/AT&T]"
];

const userAgentsWithoutSupport = [
  // Firefox
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:69.0) Gecko/20100101 Firefox/69.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
  // Safari
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13 Mobile/15E148 Safari/604.1"
];

describe("isThirdPartyCookieSupported", () => {
  userAgentsWithSupport.forEach(userAgent => {
    it(`reports true for ${userAgent}`, () => {
      const window = {
        navigator: {
          userAgent
        }
      };
      expect(isThirdPartyCookieSupported(window)).toBeTrue();
    });
  });

  userAgentsWithoutSupport.forEach(userAgent => {
    it(`reports false for ${userAgent}`, () => {
      const window = {
        navigator: {
          userAgent
        }
      };
      expect(isThirdPartyCookieSupported(window)).toBeFalse();
    });
  });
});

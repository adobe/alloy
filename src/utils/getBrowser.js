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

import memoize from "./memoize";

export const EDGE = "Edge";
export const CHROME = "Chrome";
export const FIREFOX = "Firefox";
export const IE = "IE";
export const SAFARI = "Safari";
export const UNKNOWN = "Unknown";

const matchUserAgent = regexs => {
  return userAgent => {
    const keys = Object.keys(regexs);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const regex = regexs[key];
      if (regex.test(userAgent)) {
        return key;
      }
    }
    return UNKNOWN;
  };
};

export default memoize(window => {
  return matchUserAgent({
    // The order here is important, since user agent strings of some browsers
    // contain names of other browsers (for example, Edge's contains
    // both "Chrome" and "Safari")
    [EDGE]: /Edge/,
    [CHROME]: /Chrome/,
    [FIREFOX]: /Firefox/,
    [IE]: /Trident/, // This only covers version 11, but that's all we support.
    [SAFARI]: /Safari/
  })(window.navigator.userAgent);
});

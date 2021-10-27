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
import objectKeys from "./Object.keys";

import {
  EDGE,
  EDGE_CHROMIUM,
  CHROME,
  FIREFOX,
  IE,
  SAFARI,
  UNKNOWN
} from "../constants/browser";

const matchUserAgent = regexs => {
  return userAgent => {
    const keys = objectKeys(regexs);
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
    /*
    The MIT License (MIT)

    Copyright (c) 2019 Damon Oehlman damon.oehlman@gmail.com

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
    */
    // Regular expression patterns were copied from
    // https://github.com/DamonOehlman/detect-browser
    // These are only the browsers that Alloy officially supports.
    /* eslint-disable */
    [EDGE]: /Edge\/([0-9\._]+)/,
    // Edge Chromium can dynamically change its user agent string based
    // on the host site:
    // https://winaero.com/blog/microsoft-edge-chromium-dynamically-changes-its-user-agent/
    [EDGE_CHROMIUM]: /Edg\/([0-9\.]+)/,
    [CHROME]: /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
    [FIREFOX]: /Firefox\/([0-9\.]+)(?:\s|$)/,
    // This only covers version 11 of IE, but that's all we support.
    [IE]: /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/,
    [SAFARI]: /Version\/([0-9\._]+).*Safari/
    /* eslint-enable */
  })(window.navigator.userAgent);
});

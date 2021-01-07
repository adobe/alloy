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

import { deepAssign } from "../../utils";

// URLs reported by browser APIs may not be URI-compliant because browsers are more lenient
// than the URI RFC (https://tools.ietf.org/html/rfc3986). The XDM fields we're populating,
// however, should conform to the URI spec. For this reason, we need to encode the URL.
// We decode the URL first so it doesn't end up double encoded if it was previously encoded.
const encode = url => encodeURI(decodeURI(url));

export default window => {
  return xdm => {
    const web = {
      webPageDetails: {
        URL: encode(window.location.href || window.location)
      },
      webReferrer: {
        URL: encode(window.document.referrer)
      }
    };
    deepAssign(xdm, { web });
  };
};

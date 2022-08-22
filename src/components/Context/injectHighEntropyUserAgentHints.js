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

import { deepAssign, noop } from "../../utils";
import highEntropyUserAgentHints from "../../constants/highEntropyUserAgentClientHints";

const browserSupportsUserAgentClientHints = navigator => {
  return typeof navigator.userAgentData !== "undefined";
};

export default navigator => {
  if (!browserSupportsUserAgentClientHints(navigator)) {
    return noop;
  }
  return xdm => {
    return navigator.userAgentData
      .getHighEntropyValues(highEntropyUserAgentHints)
      .then(hints => {
        const userAgentClientHints = {};
        highEntropyUserAgentHints.forEach(hint => {
          if (Object.prototype.hasOwnProperty.call(hints, hint)) {
            userAgentClientHints[hint] = hints[hint];
          }
        });
        deepAssign(xdm, {
          environment: {
            browserDetails: {
              userAgentClientHints
            }
          }
        });
      });
  };
};

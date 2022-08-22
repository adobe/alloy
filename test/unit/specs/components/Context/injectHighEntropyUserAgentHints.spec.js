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

import injectHighEntropyUserAgentHints from "../../../../../src/components/Context/injectHighEntropyUserAgentHints";

describe("Context::injectHighEntropyUserAgentHints", () => {
  const navigator = {
    userAgentData: {
      getHighEntropyValues() {
        return Promise.resolve({
          architecture: "x86",
          bitness: "64",
          model: "alloy",
          platformVersion: "1.2.3",
          wow64: false,
          invalidHint: true
        });
      }
    }
  };

  it("works", done => {
    const xdm = {};
    injectHighEntropyUserAgentHints(navigator)(xdm).then(() => {
      expect(xdm).toEqual({
        environment: {
          browserDetails: {
            userAgentClientHints: {
              architecture: "x86",
              bitness: "64",
              model: "alloy",
              platformVersion: "1.2.3",
              wow64: false
            }
          }
        }
      });
      done();
    });
  });
});

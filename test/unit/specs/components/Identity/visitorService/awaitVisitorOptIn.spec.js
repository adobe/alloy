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

import awaitVisitorOptIn from "../../../../../../src/components/Identity/visitorService/awaitVisitorOptIn";

const logger = {
  log() {}
};

describe("awaitVisitorOptIn", () => {
  beforeEach(() => {
    window.adobe = undefined;
  });

  describe("No legacy opt in object is present", () => {
    it("should return promise resolved with nonexistence message", () => {
      return expectAsync(awaitVisitorOptIn({ logger })).toBeResolvedTo(
        "Legacy opt in object does not exist."
      );
    });
  });

  describe("Legacy opt in object is present", () => {
    it("should return promise resolved with success message", () => {
      window.adobe = {
        optIn: {
          fetchPermissions(callback) {
            setTimeout(callback, 10);
          },
          isApproved() {
            return true;
          },
          Categories: {
            ECID: "ecid"
          }
        }
      };

      return expectAsync(awaitVisitorOptIn({ logger })).toBeResolvedTo(
        "Received legacy opt in approval to let Visitor retrieve ECID from server."
      );
    });
  });
});

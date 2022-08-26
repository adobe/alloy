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

import validateConfigOverride from "../../../../src/utils/validateConfigOverride";

describe("utils:validateConfigOverride", () => {
  it("should accept a valid configuration", () => {
    expect(() => {
      validateConfigOverride({
        experience_platform: {
          datasets: {
            event: "werewr",
            profile: "www"
          }
        },
        analytics: {
          reportSuites: ["sdfsfd"]
        },
        identity: {
          idSyncContainerId: "rrr"
        },
        target: {
          propertyToken: "rrr"
        }
      });
    }).not.toThrowError();
  });

  it("should accept an empty configuration", () => {
    expect(() => {
      validateConfigOverride({
        experience_platform: {
          datasets: {
            event: "werewr",
            profile: "www"
          }
        },
        analytics: {
          reportSuites: ["sdfsfd"]
        },
        identity: {
          idSyncContainerId: "rrr"
        },
        target: {
          propertyToken: "rrr"
        }
      });
    }).not.toThrowError();
  });

  it("should reject a configuration that is not an object", () => {
    [true, false, 0, "", []].forEach(val => {
      expect(() => {
        validateConfigOverride(val);
      }).toThrowError();
    });
  });
});

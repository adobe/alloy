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

import { prepareConfigOverridesForKonductor } from "../../../../src/utils";

describe("utils:prepareConfigOverridesForKonductor", () => {
  it("should add com_adobe_ to the beginning of top level keys", () => {
    expect(
      prepareConfigOverridesForKonductor({
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
      })
    ).toEqual({
      com_adobe_experience_platform: {
        datasets: {
          event: "werewr",
          profile: "www"
        }
      },
      com_adobe_analytics: {
        reportSuites: ["sdfsfd"]
      },
      com_adobe_identity: {
        idSyncContainerId: "rrr"
      },
      com_adobe_target: {
        propertyToken: "rrr"
      }
    });
  });

  it("should filter out unusesd objects and keys", () => {
    expect(
      prepareConfigOverridesForKonductor({
        experience_platform: {
          datasets: {
            event: "werewr"
          }
        },
        analytics: {
          reportSuites: []
        },
        identity: {
          idSyncContainerId: ""
        },
        target: {
          propertyToken: "rrr"
        }
      })
    ).toEqual({
      com_adobe_experience_platform: {
        datasets: {
          event: "werewr"
        }
      },
      com_adobe_target: {
        propertyToken: "rrr"
      }
    });
  });

  it("should return null for empty config objects", () => {
    expect(
      prepareConfigOverridesForKonductor({
        experience_platform: {
          datasets: {
            event: "",
            profile: ""
          }
        },
        analytics: {
          reportSuites: []
        },
        identity: {
          idSyncContainerId: ""
        },
        target: {
          propertyToken: ""
        }
      })
    ).toBeNull();
  });
});

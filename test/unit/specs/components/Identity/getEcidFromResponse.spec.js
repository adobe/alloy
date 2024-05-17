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

import getEcidFromResponse from "../../../../../src/components/Identity/getEcidFromResponse.js";

describe("Identity::getEcidFromResponse", () => {
  it("does not return ECID if ECID does not exist in response", () => {
    const response = jasmine.createSpyObj("response", {
      getPayloadsByType: [
        {
          namespace: {
            code: "other",
          },
          id: "user123",
        },
      ],
    });

    expect(getEcidFromResponse(response)).toBeUndefined();
    expect(response.getPayloadsByType).toHaveBeenCalledWith("identity:result");
  });

  it("returns ECID if ECID exists in response", () => {
    const response = jasmine.createSpyObj("response", {
      getPayloadsByType: [
        {
          namespace: {
            code: "other",
          },
          id: "user123",
        },
        {
          namespace: {
            code: "ECID",
          },
          id: "user@adobe",
        },
      ],
    });

    expect(getEcidFromResponse(response)).toBe("user@adobe");
    expect(response.getPayloadsByType).toHaveBeenCalledWith("identity:result");
  });
});

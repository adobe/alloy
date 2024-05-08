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

import createIdentityPayload from "../../../../../../src/components/Identity/getIdentity/createIdentityRequestPayload.js";
import describeRequestPayload from "../../../../helpers/describeRequestPayload.js";

describe("createIdentityRequestPayload", () => {
  describeRequestPayload(() => {
    return createIdentityPayload(["NS1", "NS2", "NS3"]);
  });

  it("adds identities", () => {
    const payload = createIdentityPayload(["NS1", "NS2", "NS3"]);
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    payload.addIdentity("IDNS", {
      id: "DEF456"
    });
    expect(payload.toJSON()).toEqual({
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            },
            {
              id: "DEF456"
            }
          ]
        }
      },
      query: { identity: { fetch: ["NS1", "NS2", "NS3"] } }
    });
  });
});

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

import createIdentityPayload from "../../../../../../src/components/Identity/getEcid/createIdentityPayload";

describe("createIdentityPayload", () => {
  it("should not use ID third-party domain when useIdThirdPartyDomain is not called", () => {
    const payload = createIdentityPayload();
    expect(payload.getUseIdThirdPartyDomain()).toBeFalse();
  });

  it("should use ID third-party domain when useIdThirdPartyDomain is called", () => {
    const payload = createIdentityPayload();
    payload.useIdThirdPartyDomain();
    expect(payload.getUseIdThirdPartyDomain()).toBeTrue();
  });

  it("serializes properly", () => {
    const payload = createIdentityPayload();
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    expect(payload.toJSON()).toEqual({
      identityMap: {
        IDNS: [
          {
            id: "ABC123"
          }
        ]
      },
      query: { identity: { fetch: ["ECID"] } }
    });
  });
});

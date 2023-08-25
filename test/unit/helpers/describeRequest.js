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

import uuidV4Regex from "../constants/uuidV4Regex";

/**
 * Tests the base methods that all types of requests share.
 */
export default createRequest => {
  describe("base request functionality", () => {
    let payload;
    let request;

    beforeEach(() => {
      payload = {};
      request = createRequest({ payload });
    });

    // getAction and getUseSendBeacon will be covered in the tests
    // for the request modules that leverage this base request.

    it("provides an ID", () => {
      expect(request.getId()).toMatch(uuidV4Regex);
    });

    it("provides payload", () => {
      expect(request.getPayload()).toBe(payload);
    });

    it("provides useThirdPartyDomain", () => {
      expect(request.getUseIdThirdPartyDomain()).toBeFalse();
      request.setUseIdThirdPartyDomain();
      expect(request.getUseIdThirdPartyDomain()).toBeTrue();
    });

    it("sets isIdentityEstablished", () => {
      // We only test that isIdentityEstablished is a function.
      // It sets an internal variable that's passed into
      // getAction and getUseSendBeacon. This part will be covered in the tests
      // for the request modules that leverage this base request.
      expect(request.setIsIdentityEstablished).toEqual(jasmine.any(Function));
    });
  });
};

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

import createResponse from "../../../../src/core/network/createResponse";

const responseDto = {
  requestId: 123,
  handle: [
    {
      type: "namespace1:action1",
      payload: "Same payload for namespace1:action1"
    }
  ]
};

describe("createResponse", () => {
  const response = createResponse(responseDto);

  describe("Response object", () => {
    it("should contain the DTO's properties and extra methods", () => {
      ["requestId", "handle", "getPayloadByType"].forEach(prop => {
        expect(response[prop]).toBeDefined();
      });
    });
  });

  describe("getPayloadByType", () => {
    it("should return the correct payload", () => {
      const type1 = "namespace1:action1";
      const payload = response.getPayloadByType(type1);
      expect(payload).toBeDefined();
      expect(payload).toEqual("Same payload for namespace1:action1");
    });
  });
});

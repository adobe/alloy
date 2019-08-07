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

import createResponse from "../../../../../src/core/network/createResponse";

const responseContent = {
  requestId: 123,
  handle: [
    {
      type: "type1",
      payload: "payload1a"
    },
    {
      type: "type2",
      payload: "payload2a"
    },
    {
      type: "type1",
      payload: "payload1b"
    },
    {
      type: "type1",
      payload: "payload1c"
    }
  ]
};

describe("createResponse", () => {
  const response = createResponse(responseContent);

  describe("getPayloadsByType", () => {
    it("handles undefined", () => {
      const emptyResponse = createResponse(undefined);
      expect(emptyResponse.getPayloadsByType("type1")).toEqual([]);
    });

    it("handles a bad response", () => {
      const emptyResponse = createResponse({ error: "bad response" });
      expect(emptyResponse.getPayloadsByType("type1")).toEqual([]);
    });

    it("returns empty array when there are no matching payloads", () => {
      expect(response.getPayloadsByType("type3")).toEqual([]);
    });

    it("returns one matching payload as an array", () => {
      expect(response.getPayloadsByType("type2")).toEqual(["payload2a"]);
    });

    it("returns three matching payloads", () => {
      expect(response.getPayloadsByType("type1")).toEqual([
        "payload1a",
        "payload1b",
        "payload1c"
      ]);
    });
  });

  describe("toJSON", () => {
    it("returns underlying content object", () => {
      expect(response.toJSON()).toBe(responseContent);
    });
  });
});

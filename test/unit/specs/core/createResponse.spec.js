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

import createResponse from "../../../../src/core/createResponse";

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
  ],
  errors: [
    {
      code: "general:100",
      message: "General error occurred."
    },
    {
      code: "personalization:204",
      message: "Personalization error occurred."
    }
  ],
  warnings: [
    {
      code: "general:101",
      message: "General warning."
    },
    {
      code: "personalization:205",
      message: "Personalization warning."
    }
  ]
};

describe("createResponse", () => {
  const response = createResponse({
    content: responseContent,
    edge: { regionId: 7 }
  });

  describe("getPayloadsByType", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ content: undefined });
      expect(emptyResponse.getPayloadsByType("type1")).toEqual([]);
    });

    it("handles content without handle key", () => {
      const emptyResponse = createResponse({ content: {} });
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

  describe("getErrors", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ content: undefined });
      expect(emptyResponse.getErrors()).toEqual([]);
    });

    it("handles content without errors key", () => {
      const emptyResponse = createResponse({ content: {} });
      expect(emptyResponse.getErrors()).toEqual([]);
    });

    it("returns errors", () => {
      expect(response.getErrors()).toBe(responseContent.errors);
    });
  });

  describe("getWarnings", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ content: undefined });
      expect(emptyResponse.getWarnings()).toEqual([]);
    });

    it("handles content without warnings key", () => {
      const emptyResponse = createResponse({ content: {} });
      expect(emptyResponse.getWarnings()).toEqual([]);
    });

    it("returns warnings", () => {
      expect(response.getWarnings()).toBe(responseContent.warnings);
    });
  });

  describe("getEdge", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ edge: undefined });
      expect(emptyResponse.getEdge()).toEqual({});
    });

    it("handles content without warnings key", () => {
      const emptyResponse = createResponse({ edge: {} });
      expect(emptyResponse.getEdge()).toEqual({});
    });

    it("returns the edge info", () => {
      expect(response.getEdge()).toEqual({ regionId: 7 });
    });
  });

  describe("toJSON", () => {
    it("returns underlying content object", () => {
      expect(response.toJSON()).toBe(responseContent);
    });
  });
});


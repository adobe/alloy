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

import injectCreateResponse from "../../../../src/core/injectCreateResponse.js";

const responseContent = {
  requestId: 123,
  handle: [
    {
      type: "type1",
      payload: "payload1a",
    },
    {
      type: "type2",
      payload: "payload2a",
    },
    {
      type: "type1",
      payload: "payload1b",
    },
    {
      type: "type1",
      payload: "payload1c",
    },
  ],
  errors: [
    {
      code: "general:100",
      message: "General error occurred.",
    },
    {
      code: "personalization:204",
      message: "Personalization error occurred.",
    },
  ],
  warnings: [
    {
      code: "general:101",
      message: "General warning.",
    },
    {
      code: "personalization:205",
      message: "Personalization warning.",
    },
  ],
};

describe("createResponse", () => {
  let extractEdgeInfo;
  let getHeader;
  let createResponse;
  let response;

  beforeEach(() => {
    extractEdgeInfo = jasmine.createSpy("extractEdgeInfo");
    getHeader = jasmine.createSpy("getHeader");
    createResponse = injectCreateResponse({ extractEdgeInfo });
    response = createResponse({
      content: responseContent,
      getHeader,
    });
  });

  describe("getPayloadsByType", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ content: undefined });
      expect(emptyResponse.getPayloadsByType("type1")).toEqual([]);
    });

    it("handles content without handle property", () => {
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
        "payload1c",
      ]);
    });
  });

  describe("getErrors", () => {
    it("handles undefined content", () => {
      const emptyResponse = createResponse({ content: undefined });
      expect(emptyResponse.getErrors()).toEqual([]);
    });

    it("handles content without errors property", () => {
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

    it("handles content without warnings property", () => {
      const emptyResponse = createResponse({ content: {} });
      expect(emptyResponse.getWarnings()).toEqual([]);
    });

    it("returns warnings", () => {
      expect(response.getWarnings()).toBe(responseContent.warnings);
    });
  });

  describe("getEdge", () => {
    it("calls extractEdgeInfo with x-adobe-edge header and returns the result", () => {
      extractEdgeInfo.and.returnValue({ regionId: 42 });
      getHeader.and.returnValue("VA6;42");
      expect(response.getEdge()).toEqual({ regionId: 42 });
      expect(extractEdgeInfo).toHaveBeenCalledWith("VA6;42");
      expect(getHeader).toHaveBeenCalledWith("x-adobe-edge");
    });
  });

  describe("toJSON", () => {
    it("returns underlying content object", () => {
      expect(response.toJSON()).toBe(responseContent);
    });
  });
});

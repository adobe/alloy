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

import {
  urlStartsWithScheme,
  getAbsoluteUrlFromAnchorElement,
  isSupportedAnchorElement
} from "../../../../../src/components/DataCollector/utils";

const initAnchorState = (window, element, anchorState) => {
  element.href = anchorState["element.href"];
  element.protocol = anchorState["element.protocol"];
  element.host = anchorState["element.host"];
  window.location.protocol = anchorState["window.location.protocol"];
  window.location.host = anchorState["window.location.host"];
  window.location.pathname = anchorState["window.location.pathname"];
};

describe("DataCollector::utils", () => {
  describe("urlStartsWithScheme", () => {
    it("Returns true for URLs that starts with a scheme", () => {
      const urlsThatStartsWithScheme = [
        "http://example.com",
        "https://example.com",
        "https://example.com:123/example?example=123",
        "file://example.txt"
      ];
      urlsThatStartsWithScheme.forEach(url => {
        expect(urlStartsWithScheme(url)).toBe(true);
      });
    });
    it("Returns false for URLs that does not start with a scheme", () => {
      const urlsThatDoesNotStartWithScheme = [
        "example.com",
        "example.txt/http://example",
        "https:",
        "//example.html"
      ];
      urlsThatDoesNotStartWithScheme.forEach(url => {
        expect(urlStartsWithScheme(url)).toBe(false);
      });
    });
  });
  describe("getAbsoluteUrlFromAnchorElement", () => {
    it("Makes best attempt to constructs absolute URLs", () => {
      const window = {
        location: {
          protocol: "",
          host: "",
          pathname: ""
        }
      };
      const element = {
        protocol: "",
        host: ""
      };
      const anchorStates = [
        {
          "element.href": "http://example.com/example.html",
          "element.protocol": "",
          "element.host": "",
          "window.location.protocol": "http:",
          "window.location.host": "example.com",
          "window.location.pathname": "/",
          expectedResult: "http://example.com/example.html"
        },
        {
          "element.href": "example.html",
          "element.protocol": "",
          "element.host": "",
          "window.location.protocol": "https:",
          "window.location.host": "example.com",
          "window.location.pathname": "/",
          expectedResult: "https://example.com/example.html"
        }
      ];
      anchorStates.forEach(anchorState => {
        initAnchorState(window, element, anchorState);
        expect(getAbsoluteUrlFromAnchorElement(window, element)).toBe(
          anchorState.expectedResult
        );
      });
    });
  });
  describe("isSupportedAnchorElement", () => {
    it("Returns true for supported anchor elements", () => {
      const validAnchorElements = [
        {
          href: "http://example.com",
          tagName: "A"
        },
        {
          href: "http://example.com",
          tagName: "AREA"
        }
      ];
      validAnchorElements.forEach(element => {
        expect(isSupportedAnchorElement(element)).toBe(true);
      });
    });
    it("Returns false for unsupported anchor elements", () => {
      const invalidAnchorElements = [
        {},
        {
          href: ""
        },
        {
          href: "http://example.com"
        },
        {
          href: "http://example.com",
          tagName: "LINK"
        },
        {
          href: "http://example.com",
          tagName: "A",
          onclick: "example();",
          protocol: " javascript:"
        }
      ];
      invalidAnchorElements.forEach(element => {
        expect(isSupportedAnchorElement(element)).toBe(false);
      });
    });
  });
});

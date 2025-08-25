/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import getAbsoluteUrlFromAnchorElement from "../../../../../../../packages/core/src/components/ActivityCollector/utils/dom/getAbsoluteUrlFromAnchorElement.js";

const initAnchorState = (window, element, anchorState) => {
  element.href = anchorState["element.href"];
  window.location.href = anchorState["window.location.href"];
};
describe("ActivityCollector::getAbsoluteUrlFromAnchorElement", () => {
  it("Makes best attempt to constructs absolute URLs", () => {
    const window = {
      location: {
        href: "",
      },
    };
    const element = {
      href: "",
    };
    const anchorStates = [
      {
        "element.href": "http://example.com/example.html",
        "window.location.href": "http://example.com/example.html",
        expectedResult: "http://example.com/example.html",
      },
      {
        "element.href": "example.html",
        "window.location.href": "http://example.com/example.html",
        expectedResult: "http://example.com/example.html",
      },
      {
        "element.href": "mailto:email@domain.com",
        "window.location.href": "http://example.com/example.html",
        expectedResult: "mailto:email@domain.com",
      },
      {
        "element.href": "tel:1234567",
        "window.location.href": "https://example.com/example.html",
        expectedResult: "tel:1234567",
      },
      {
        "element.href": null,
        "window.location.href": "http://example.com/example.html",
        expectedResult: "http://example.com/example.html",
      },
      {
        "element.href": { my: "object" },
        "window.location.href": "http://example.com/",
        expectedResult: "http://example.com/",
      },
    ];
    anchorStates.forEach((anchorState) => {
      initAnchorState(window, element, anchorState);
      expect(getAbsoluteUrlFromAnchorElement(window, element)).toBe(
        anchorState.expectedResult,
      );
    });
  });

  it("handles invalid URLs", () => {
    const window = {
      location: {
        href: "http://example.com/example.html",
      },
    };
    const element = {
      href: "hello world",
    };
    expect(() =>
      getAbsoluteUrlFromAnchorElement(window, element),
    ).not.toThrow();
  });
});

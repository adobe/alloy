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

import getAbsoluteUrlFromAnchorElement from "../../../../../../../src/components/ActivityCollector/utils/dom/getAbsoluteUrlFromAnchorElement.js";

const initAnchorState = (window, element, anchorState) => {
  element.href = anchorState["element.href"];
  element.protocol = anchorState["element.protocol"];
  element.host = anchorState["element.host"];
  window.location.protocol = anchorState["window.location.protocol"];
  window.location.host = anchorState["window.location.host"];
  window.location.pathname = anchorState["window.location.pathname"];
};

describe("ActivityCollector::getAbsoluteUrlFromAnchorElement", () => {
  it("Makes best attempt to constructs absolute URLs", () => {
    const window = {
      location: {
        protocol: "",
        host: "",
        pathname: "",
      },
    };
    const element = {
      protocol: "",
      host: "",
    };
    const anchorStates = [
      {
        "element.href": "http://example.com/example.html",
        "element.protocol": "",
        "element.host": "",
        "window.location.protocol": "http:",
        "window.location.host": "example.com",
        "window.location.pathname": "/",
        expectedResult: "http://example.com/example.html",
      },
      {
        "element.href": "example.html",
        "element.protocol": "",
        "element.host": "",
        "window.location.protocol": "https:",
        "window.location.host": "example.com",
        "window.location.pathname": "/",
        expectedResult: "https://example.com/example.html",
      },
    ];
    anchorStates.forEach((anchorState) => {
      initAnchorState(window, element, anchorState);
      expect(getAbsoluteUrlFromAnchorElement(window, element)).toBe(
        anchorState.expectedResult,
      );
    });
  });
});

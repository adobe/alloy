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

import isSupportedAnchorElement from "../../../../../../../src/components/ActivityCollector/utils/dom/isSupportedAnchorElement";

describe("ActivityCollector::isSupportedAnchorElement", () => {
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

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

import isSupportedTextNode from "../../../../../../../src/components/ActivityCollector/utils/dom/isSupportedTextNode.js";

describe("ActivityCollector::isSupportedTextNode", () => {
  it("should return true for text node", () => {
    const textNode = document.createTextNode("text");
    expect(isSupportedTextNode(textNode)).toBe(true);
  });

  it("should return false for comment node", () => {
    const commentNode = document.createComment("comment");
    expect(isSupportedTextNode(commentNode)).toBe(false);
  });

  it("should return true for a paragraph node", () => {
    const paragraphNode = document.createElement("p");
    expect(isSupportedTextNode(paragraphNode)).toBe(true);
  });

  it("should return false for a script node", () => {
    const scriptNode = document.createElement("script");
    expect(isSupportedTextNode(scriptNode)).toBe(false);
  });

  it("should return false for a style node", () => {
    const styleNode = document.createElement("style");
    expect(isSupportedTextNode(styleNode)).toBe(false);
  });

  it("should return false for a link node", () => {
    const linkNode = document.createElement("link");
    expect(isSupportedTextNode(linkNode)).toBe(false);
  });
});

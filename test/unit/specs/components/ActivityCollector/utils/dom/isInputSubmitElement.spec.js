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

import isInputSubmitElement from "../../../../../../../src/components/ActivityCollector/utils/dom/isInputSubmitElement.js";

describe("ActivityCollector::isInputSubmitElement", () => {
  it("should return true for submit input", () => {
    const input = document.createElement("input");
    input.type = "submit";
    expect(isInputSubmitElement(input)).toBe(true);
  });

  it("should return true for image input", () => {
    const input = document.createElement("input");
    input.type = "image";
    input.src = "https://example.com/image.png";
    expect(isInputSubmitElement(input)).toBe(true);
  });

  it("should return false for non-submit input", () => {
    const input = document.createElement("input");
    input.type = "text";
    expect(isInputSubmitElement(input)).toBe(false);
  });

  it("should return false for non-input element", () => {
    const div = document.createElement("div");
    expect(isInputSubmitElement(div)).toBe(false);
  });
});

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

import findClickableElement from "../../../../../../../src/components/ActivityCollector/utils/dom/findClickableElement.js";

describe("ActivityCollector::findClickableElement", () => {
  it("returns null if no clickable element is found", () => {
    const element = document.createElement("div");
    const parentElement = document.createElement("div");
    parentElement.appendChild(element);
    expect(findClickableElement(element)).toBeNull();
  });

  it("returns the target element if it is clickable", () => {
    const element = document.createElement("a");
    element.href = "http://www.example.com";
    expect(findClickableElement(element)).toBe(element);
  });

  it("returns the target element's parent if it is not clickable", () => {
    const element = document.createElement("div");
    const parentElement = document.createElement("a");
    parentElement.href = "http://www.example.com";
    parentElement.appendChild(element);
    expect(findClickableElement(element)).toBe(parentElement);
  });
});

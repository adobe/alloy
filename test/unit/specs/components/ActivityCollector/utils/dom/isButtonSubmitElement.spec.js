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

import isButtonSubmitElement from "../../../../../../../src/components/ActivityCollector/utils/dom/isButtonSubmitElement";

describe("ActivityCollector::isButtonSubmitElement", () => {
  it("should return true for submit button", () => {
    const button = document.createElement("button");
    button.type = "submit";
    expect(isButtonSubmitElement(button)).toBe(true);
  });

  it("should return true for button with no type", () => {
    // This is the default type for a button element
    const button = document.createElement("button");
    expect(isButtonSubmitElement(button)).toBe(true);
  });

  it("should return false for non-submit button", () => {
    const button = document.createElement("button");
    button.type = "button";
    expect(isButtonSubmitElement(button)).toBe(false);
  });

  it("should return false for input element", () => {
    const input = document.createElement("input");
    input.type = "submit";
    expect(isButtonSubmitElement(input)).toBe(false);
  });

  it("should return false for non-button element", () => {
    const div = document.createElement("div");
    expect(isButtonSubmitElement(div)).toBe(false);
  });
});

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
  it("returns an area element with a href", () => {
    const element = document.createElement("area");
    element.href = "http://www.example.com";
    expect(findClickableElement(element)).toBe(element);
  });
  it("returns a submit input or button", () => {
    const input = document.createElement("input");
    input.setAttribute("type", "submit");
    const button = document.createElement("button");
    button.type = "submit";
    expect(findClickableElement(input)).toBe(input);
    expect(findClickableElement(button)).toBe(button);
  });
  it("returns any other element with a click handler", () => {
    const element = document.createElement("span");
    const parentElement = document.createElement("div");
    parentElement.onclick = () => {};
    parentElement.appendChild(element);
    expect(findClickableElement(element)).toBe(parentElement);
  });
  it("skips non-element ancestors", () => {
    const fragment = document.createDocumentFragment();
    const element = document.createElement("div");
    fragment.appendChild(element);
    expect(findClickableElement(element)).toBeNull();
  });
  it("returns null if the BODY node is reached", () => {
    const element = document.createElement("div");
    const parentElement = document.createElement("body");
    const grandParentElement = document.createElement("html");
    grandParentElement.setAttribute("onClick", "clickity");
    grandParentElement.appendChild(parentElement);
    parentElement.appendChild(element);
    expect(findClickableElement(element)).toBeNull();
  });
});

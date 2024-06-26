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

import createNode from "../../../../../src/utils/dom/createNode.js";

describe("DOM::createNode", () => {
  it("should createNode with tag only", () => {
    const element = createNode("DIV");

    expect(element.tagName).toEqual("DIV");
  });

  it("should createNode with tag and attrs", () => {
    const element = createNode("DIV", { id: "create" });

    expect(element.tagName).toEqual("DIV");
    expect(element.id).toEqual("create");
  });

  it("should createNode with tag, child", () => {
    const element = createNode("DIV", {}, {}, [createNode("p")]);

    expect(element.tagName).toEqual("DIV");
    expect(element.firstElementChild.tagName).toEqual("P");
  });

  it("supports style attribute objects", () => {
    const element = createNode("DIV", {}, { style: { color: "blue" } });
    expect(element.tagName).toEqual("DIV");
    expect(element.style.color).toEqual("blue");
  });

  it("supports style attribute strings", () => {
    const element = createNode("DIV", { style: "color: blue;" });
    expect(element.tagName).toEqual("DIV");
    expect(element.style.color).toEqual("blue");
  });
});

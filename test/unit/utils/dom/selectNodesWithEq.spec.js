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
  createNode,
  appendNode,
  selectNodes,
  removeNode
} from "../../../../src/utils/dom";
import {
  escapeDigitsInSelector,
  parseSelector,
  selectNodesWithEq
} from "../../../../src/utils/dom/selectNodesWithEq";

describe("DOM::escapeDigitsInSelector", () => {
  it("should escape when digits only for ID selector", () => {
    const result = escapeDigitsInSelector("#123");

    expect(result).toEqual("#\\31 23");
    expect(document.querySelector(result)).toEqual(null);
  });

  it("should escape when digits only for class selector", () => {
    const result = escapeDigitsInSelector(".123");

    expect(result).toEqual(".\\31 23");
    expect(document.querySelector(result)).toEqual(null);
  });

  it("should escape when hyphen and digits ID selector", () => {
    const result = escapeDigitsInSelector("#-123");

    expect(result).toEqual("#-\\31 23");
    expect(document.querySelector(result)).toEqual(null);
  });

  it("should escape when hyphen and digits class selector", () => {
    const result = escapeDigitsInSelector(".-123");

    expect(result).toEqual(".-\\31 23");
    expect(document.querySelector(result)).toEqual(null);
  });
});

describe("DOM::parseSelector", () => {
  it("should parse selector when no eq", () => {
    const result = parseSelector("#test");

    expect(result[0]).toEqual({ sel: "#test" });
  });

  it("should parse selector when eq", () => {
    const result = parseSelector(
      "HTML > BODY > DIV.wrapper:eq(0) > HEADER.header:eq(0) > DIV.pagehead:eq(0) > P:nth-of-type(1)"
    );

    expect(result[0]).toEqual({ sel: "HTML > BODY > DIV.wrapper", eq: 0 });
    expect(result[1]).toEqual({ sel: "HEADER.header", eq: 0 });
    expect(result[2]).toEqual({ sel: "DIV.pagehead", eq: 0 });
    expect(result[3]).toEqual({ sel: "P:nth-of-type(1)" });
  });
});

describe("DOM::selectNodesWithEq", () => {
  afterEach(() => {
    selectNodes(".eq").forEach(removeNode);
  });

  it("should select when no eq", () => {
    appendNode(document.body, createNode("DIV", { id: "noEq", class: "eq" }));

    const result = selectNodesWithEq("#noEq");

    expect(result[0].tagName).toEqual("DIV");
    expect(result[0].id).toEqual("noEq");
  });

  it("should select when eq and just one element", () => {
    const content = `
      <div class="b">
        <div class="c">first</div>

        <div class="c">second</div>
        
        <div class="c">third</div>
      </div>
    `;

    appendNode(
      document.body,
      createNode("DIV", { id: "abc", class: "eq" }, { innerHTML: content })
    );

    const result = selectNodesWithEq("#abc:eq(0) > div.b:eq(0) > div.c:eq(0)");

    expect(result[0].tagName).toEqual("DIV");
    expect(result[0].textContent).toEqual("first");
  });

  it("should select when eq and multiple elements", () => {
    const content = `
      <div class="b">
        <div class="c">first</div>

        <div class="c">second</div>
        
        <div class="c">third</div>
      </div>
    `;

    appendNode(
      document.body,
      createNode("DIV", { id: "abc", class: "eq" }, { innerHTML: content })
    );

    const result = selectNodesWithEq("#abc:eq(0) > div.b:eq(0) > div.c");

    expect(result[0].tagName).toEqual("DIV");
    expect(result[0].textContent).toEqual("first");
    expect(result[1].tagName).toEqual("DIV");
    expect(result[1].textContent).toEqual("second");
    expect(result[2].tagName).toEqual("DIV");
    expect(result[2].textContent).toEqual("third");
  });
});

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
} from "../../../../../../../src/utils/dom";
import matchesSelectorWithEq from "../../../../../../../src/components/Personalization/dom-actions/dom/matchesSelectorWithEq.js";

describe("Personalization::DOM::matchesSelectorWithEq", () => {
  afterEach(() => {
    selectNodes(".eq").forEach(removeNode);
  });

  it("should match when no eq", () => {
    const node = createNode("DIV", { id: "noEq", class: "eq" });

    appendNode(document.body, node);

    const selector = "#noEq";
    const element = document.getElementById("noEq");
    const result = matchesSelectorWithEq(selector, element);

    expect(result).toEqual(true);
  });

  it("should match when eq and just one element", () => {
    const content = `
      <div class="b">
        <div id="one" class="c">first</div>

        <div id="two" class="c">second</div>
        
        <div id="three" class="c">third</div>
      </div>
    `;
    const node = createNode(
      "DIV",
      { id: "abc", class: "eq" },
      {
        innerHTML: content
      }
    );

    appendNode(document.body, node);

    const selector = "#abc:eq(0) > div.b:eq(0) > div.c:eq(0)";
    const element = document.getElementById("one");
    const result = matchesSelectorWithEq(selector, element);

    expect(result).toEqual(true);
  });

  it("should match when eq and multiple elements", () => {
    const content = `
      <div class="b">
        <div id="one" class="c">first</div>

        <div id="two" class="c">second</div>
        
        <div id="three" class="c">third</div>
      </div>
    `;

    const node = createNode(
      "DIV",
      { id: "abc", class: "eq" },
      { innerHTML: content }
    );

    appendNode(document.body, node);

    const selector = "#abc:eq(0) > div.b:eq(0) > div.c";
    const one = document.getElementById("one");
    const two = document.getElementById("two");
    const three = document.getElementById("three");

    expect(matchesSelectorWithEq(selector, one)).toEqual(true);
    expect(matchesSelectorWithEq(selector, two)).toEqual(true);
    expect(matchesSelectorWithEq(selector, three)).toEqual(true);
  });
});

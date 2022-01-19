/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  appendNode,
  createNode,
  removeNode,
  selectNodes
} from "../../../../../src/utils/dom";
import querySelectorAll from "../../../../../src/utils/dom/querySelectorAll";

describe("Personalization::DOM::querySelectorAll", () => {
  afterEach(() => {
    selectNodes(".qsa").forEach(removeNode);
  });

  it("should select with querySelectorAll", () => {
    const node = createNode(
      "DIV",
      { id: "abc", class: "qsa" },
      {
        innerHTML: `<div class="test">Test</div>`
      }
    );

    appendNode(document.body, node);

    const selector = ".test";
    const result = querySelectorAll(document, selector);
    expect(Array.isArray(result)).toBeTrue();
    expect(result[0]).toEqual(node.children[0]);
  });
});

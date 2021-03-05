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
import collectClicks from "../../../../../../../src/components/Personalization/dom-actions/clicks/collectClicks";

describe("Personalization::tracking::clicks", () => {
  afterEach(() => {
    selectNodes(".eq").forEach(removeNode);
  });

  it("should collect clicks", () => {
    const meta = [
      {
        id: "AT:1234",
        scope: "example_scope"
      }
    ];
    const getClickMetasBySelector = jasmine
      .createSpy("getClickMetasBySelector")
      .and.returnValue(meta);
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

    const selectors = ["#abc:eq(0) > div.b:eq(0) > div.c"];

    const element = document.getElementById("one");
    const result = collectClicks(element, selectors, getClickMetasBySelector);

    expect(result).toEqual(meta);
  });
});

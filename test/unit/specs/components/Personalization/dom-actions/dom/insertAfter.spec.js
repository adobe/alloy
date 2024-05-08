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

import insertAfter from "../../../../../../../src/components/Personalization/dom-actions/dom/insertAfter.js";
import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../../src/utils/dom";
import {
  getElementById,
  getNextSibling
} from "../../../../../../../src/components/Personalization/dom-actions/dom";

describe("Personalization::DOM::insertAfter", () => {
  afterEach(() => {
    selectNodes("#style1").forEach(removeNode);
    selectNodes("#style2").forEach(removeNode);
  });

  it("inserts a node after an element", () => {
    const element1 = createNode("style", { id: "style1" });
    const element2 = createNode("style", { id: "style2" });
    appendNode(document.head, element1);
    insertAfter(element1, element2);

    const node1 = getElementById("style1");
    const node2 = getNextSibling(node1);

    expect(node2.id).toEqual("style2");
  });
});

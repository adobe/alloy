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

import getParent from "../../../../../../../src/components/Personalization/dom-actions/dom/getParent";
import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../../src/utils/dom";
import { getElementById } from "../../../../../../../src/components/Personalization/dom-actions/dom";

describe("Personalization::DOM::getParent", () => {
  afterEach(() => {
    selectNodes("#parentId").forEach(removeNode);
    selectNodes("#childId").forEach(removeNode);
  });

  it("returns the parent node if exists", () => {
    const parentNode = createNode("div", { id: "parentId" });
    const childNode = createNode("div", { id: "childId" });

    appendNode(parentNode, childNode);
    appendNode(document.head, parentNode);

    const result = getParent(getElementById("childId"));

    expect(result.tagName).toEqual("DIV");
    expect(result.id).toEqual("parentId");
  });
});

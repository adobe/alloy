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
import appendNode from "../../../../../src/utils/dom/appendNode.js";
import removeNode from "../../../../../src/utils/dom/removeNode.js";
import selectNodes from "../../../../../src/utils/dom/selectNodes.js";

describe("DOM::removeNode", () => {
  afterEach(() => {
    selectNodes("div").forEach(removeNode);
  });

  it("should remove a node from head tag", () => {
    const node = createNode("div", { id: "remove" });

    removeNode(appendNode(document.head, node));

    expect(selectNodes("#remove").length).toEqual(0);
  });
});

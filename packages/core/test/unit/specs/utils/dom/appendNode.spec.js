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

import { afterEach, describe, it, expect } from "vitest";
import createNode from "../../../../../src/utils/dom/createNode.js";
import appendNode from "../../../../../src/utils/dom/appendNode.js";
import selectNodes from "../../../../../src/utils/dom/selectNodes.js";
import removeNode from "../../../../../src/utils/dom/removeNode.js";

describe("DOM::appendNode", () => {
  afterEach(() => {
    selectNodes("div").forEach(removeNode);
  });
  it("should append a node to head tag", () => {
    const elem = createNode("div", {
      id: "append",
    });
    appendNode(document.head, elem);
    expect(selectNodes("#append").length).toEqual(1);
  });
});

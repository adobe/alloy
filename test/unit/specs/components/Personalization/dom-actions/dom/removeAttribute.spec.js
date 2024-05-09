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

import removeAttribute from "../../../../../../../src/components/Personalization/dom-actions/dom/removeAttribute.js";
import {
  createNode,
  removeNode,
  selectNodes,
} from "../../../../../../../src/utils/dom";
import {
  getAttribute,
  setAttribute,
} from "../../../../../../../src/components/Personalization/dom-actions/dom";

describe("Personalization::DOM::removeAttribute", () => {
  afterEach(() => {
    selectNodes("#fooId").forEach(removeNode);
  });

  it("should remove the element's attribute", () => {
    const element = createNode("div", { id: "fooId" });
    setAttribute(element, "data-foo", "dummyValue");

    const attr = getAttribute(element, "data-foo");
    expect(attr).toEqual("dummyValue");

    removeAttribute(element, "data-foo");
    const removedAttr = getAttribute(element, "data-foo");

    expect(removedAttr).toBeNull();
  });
});

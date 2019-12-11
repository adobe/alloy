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

import getNextSibling from "../../../../../../../src/components/Personalization/helper/dom/getNextSibling";
import createFragment from "../../../../../../../src/components/Personalization/helper/dom/createFragment";
import getFirstChild from "../../../../../../../src/components/Personalization/helper/dom/getFirstChild";

describe("Personalization::helper::dom::getNextSibling", () => {
  it("returns the elements next sibling", () => {
    const element = createFragment(
      `<div id="foo">foo</div><h1>hello there</h1>`
    );
    const firstElement = getFirstChild(element);
    const nextSibling = getNextSibling(firstElement);

    expect(nextSibling.tagName).toEqual("H1");
  });

  it("returns null if the elements doesn't have a sibling node", () => {
    const element = createFragment(`<div id="foo">foo</div>`);
    const firstElement = getFirstChild(element);
    const nextSibling = getNextSibling(firstElement);

    expect(nextSibling).toBeNull();
  });
});

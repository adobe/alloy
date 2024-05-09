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

import getChildNodes from "../../../../../../../src/components/Personalization/dom-actions/dom/getChildNodes.js";
import createFragment from "../../../../../../../src/components/Personalization/dom-actions/dom/createFragment.js";

describe("Personalization::helper::dom::getChildNodes", () => {
  it("returns an array of child nodes", () => {
    const element = createFragment(
      `<div id="foo">foo</div><h1>hello there</h1><div id="div2"></div>`,
    );
    const result = getChildNodes(element);

    expect(result.length).toEqual(3);
    expect(result[0].tagName).toEqual("DIV");
    expect(result[1].tagName).toEqual("H1");
    expect(result[2].id).toEqual("div2");
  });

  it("returns undefined when there are no children", () => {
    const element = createFragment();
    const result = getChildNodes(element);

    expect(result.length).toEqual(1);
    expect(result[0].tagName).toBeUndefined();
  });
});

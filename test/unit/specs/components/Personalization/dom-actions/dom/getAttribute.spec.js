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

import getAttribute from "../../../../../../../src/components/Personalization/dom-actions/dom/getAttribute.js";
import createFragment from "../../../../../../../src/components/Personalization/dom-actions/dom/createFragment.js";

describe("Personalization::helper::dom::getAttribute", () => {
  it("returns element's attribute if exists", () => {
    const element = createFragment(`<div id="foo">foo</div>`);
    const name = "id";
    const result = getAttribute(element.firstElementChild, name);

    expect(result).toEqual("foo");
  });

  it("returns null if element doesn't have this attribute", () => {
    const element = createFragment(`<div id="foo">foo</div>`);
    const name = "title";
    const result = getAttribute(element.firstElementChild, name);

    expect(result).toBeNull();
  });
});

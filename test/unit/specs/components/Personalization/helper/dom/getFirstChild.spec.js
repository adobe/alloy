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

// eslint-disable-next-line no-unused-vars
import getFirstChild from "../../../../../../../src/components/Personalization/helper/dom/getFirstChild";
import createFragment from "../../../../../../../src/components/Personalization/helper/dom/createFragment";

describe("Personalization::helper::dom::getFirstChild", () => {
  it("the element's getFirstChild should be a div", () => {
    const element = createFragment(
      `<h1>hello there</h1><div id="foo">foo</div>`
    );
    const result = getFirstChild(element);

    expect(result.tagName).toEqual("H1");
  });
});

describe("Personalization::helper::dom::getFirstChild", () => {
  it("the getFirstChild element should be null", () => {
    const element = createFragment();
    const result = getFirstChild(element);

    expect(result).toBeNull();
  });
});

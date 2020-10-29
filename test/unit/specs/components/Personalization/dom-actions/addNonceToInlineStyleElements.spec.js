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

import addNonceToInlineStyleElements from "../../../../../../src/components/Personalization/dom-actions/addNonceToInlineStyleElements";
import { testResetCachedNonce } from "../../../../../../src/components/Personalization/dom-actions/dom/getNonce";
import { createFragment } from "../../../../../../src/components/Personalization/dom-actions/dom";
import { STYLE } from "../../../../../../src/constants/tagName";
import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";

describe("Personalization::dom-actions::addNonceToInlineStyleElements", () => {
  afterEach(() => {
    selectNodes("#fooById").forEach(removeNode);
  });

  it("should add nonce to inline style elements if available", () => {
    testResetCachedNonce();
    // Make sure a nonce is available to alloy
    appendNode(
      document.head,
      createNode("script", { id: "fooById", nonce: "123" })
    );
    const fragmentHtml = "<style>h1 { opacity: 0.5 };</style>";
    const fragment = createFragment(fragmentHtml);
    addNonceToInlineStyleElements(fragment);
    const styleNodes = selectNodes(STYLE, fragment);
    expect(styleNodes[0].nonce).toEqual("123");
  });
});

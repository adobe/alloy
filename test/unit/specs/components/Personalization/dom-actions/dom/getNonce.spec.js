/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { testResetCachedNonce } from "../../../../../../../src/components/Personalization/dom-actions/dom/getNonce.js";
import {
  selectNodes,
  removeNode,
  appendNode,
  createNode,
} from "../../../../../../../src/utils/dom/index.js";
import { getNonce } from "../../../../../../../src/components/Personalization/dom-actions/dom/index.js";

describe("Personalization::DOM::getNonce", () => {
  afterEach(() => {
    selectNodes("#fooById").forEach(removeNode);
  });

  it("should return the nonce if defined", () => {
    testResetCachedNonce();
    appendNode(
      document.head,
      createNode("script", { id: "fooById", nonce: "123" }),
    );
    expect(getNonce()).toEqual("123");
  });
});

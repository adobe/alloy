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

import awaitSelector from "../../../../src/utils/dom/awaitSelector";
import selectNodes from "../../../../src/utils/dom/selectNodes";
import { createNode, appendNode, removeNode } from "../../../../src/utils/dom";

describe("awaitSelector", () => {
  const createAndAppendNodeDelayed = id => {
    setTimeout(() => {
      appendNode(document.head, createNode("div", { id }));
    }, 50);
  };

  const cleanUp = id => {
    const nodes = selectNodes(`#${id}`);

    removeNode(nodes[0]);
  };

  const awaitSelectorAndAssert = (id, win, doc, done) => {
    const result = awaitSelector(`#${id}`, 1000, selectNodes, win, doc);

    createAndAppendNodeDelayed(id);

    result
      .then(nodes => {
        done();
        cleanUp(id);
        expect(nodes[0].tagName).toEqual("DIV");
      })
      .catch(() => {
        done();
        cleanUp(id);
        fail(`${id} should be found`);
      });
  };

  it("await via MutationObserver", done => {
    awaitSelectorAndAssert("abc", window, document, done);
  });

  it("await via requestAnimationFrame", done => {
    const win = { requestAnimationFrame: window.requestAnimationFrame };
    const doc = { visibilityState: "visible" };

    awaitSelectorAndAssert("def", win, doc, done);
  });

  it("await via timer", done => {
    const win = {};
    const doc = {};

    awaitSelectorAndAssert("ghi", win, doc, done);
  });
});

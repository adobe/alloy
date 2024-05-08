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

import awaitSelector from "../../../../../src/utils/dom/awaitSelector.js";
import selectNodes from "../../../../../src/utils/dom/selectNodes.js";
import {
  createNode,
  appendNode,
  removeNode
} from "../../../../../src/utils/dom";

describe("DOM::awaitSelector", () => {
  const createAndAppendNodeDelayed = id => {
    setTimeout(() => {
      appendNode(document.head, createNode("div", { id }));
    }, 50);
  };

  const cleanUp = id => {
    const nodes = selectNodes(`#${id}`);

    removeNode(nodes[0]);
  };

  const awaitSelectorAndAssert = (id, win, doc) => {
    const result = awaitSelector(`#${id}`, selectNodes, 1000, win, doc);

    createAndAppendNodeDelayed(id);

    return result
      .then(nodes => {
        expect(nodes[0].tagName).toEqual("DIV");
      })
      .finally(() => {
        cleanUp(id);
      })
      .catch(e => {
        throw new Error(`${id} should be found. Error was ${e}`);
      });
  };

  it("await via MutationObserver", () => {
    return awaitSelectorAndAssert("abc", window, document);
  });

  it("await via requestAnimationFrame", () => {
    const win = {
      requestAnimationFrame: window.requestAnimationFrame.bind(window)
    };
    const doc = { visibilityState: "visible" };

    return awaitSelectorAndAssert("def", win, doc);
  });

  it("await via timer", () => {
    const win = {};
    const doc = {};

    return awaitSelectorAndAssert("ghi", win, doc);
  });
});

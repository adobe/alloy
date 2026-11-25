/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
Drivers for the object editor (src/view/components/objectEditor): the tree on
the left and the node edit form on the right. Nothing here is specific to the
XDM object data element, so any view that renders <Editor> can use them.

  const editor = createObjectEditor(view); // `view` from useView()

  editor.tree.node(spec[, { index }])    // tree node. `spec` is the exact title,
                                          // or an array of titles forming a chain
                                          // of directly nested nodes ending at the
                                          // node, e.g. ["Item 1", "_id"]. A spec
                                          // that matches several nodes throws
                                          // unless `index` (0-based, DOM order)
                                          // picks one.
    .click() / .expand() / .collapse()    // expand/collapse are idempotent
    .expectExists() / .expectNotExists()
    .expectSelected() / .expectExpanded()
    .expectInViewport() / .expectOutOfViewport()
    .scrollAway()                         // scrolls to the bottom until the node
                                          // is out of view (use a short viewport)
    .expectValid() / .expectInvalid()     // error icon; call
                                          // driver.expectValidate() first so
                                          // fields count as touched
    .population.expectFull() / .expectPartial() / .expectEmpty() / .expectBlank()
  editor.tree.nodeNames()                 // rendered node titles, top to bottom

  editor.string / .integer / .number      // enterValue, clear, expectValue,
                                          // expectVisible, expectHidden,
                                          // expectError
  editor.boolean / .enum                  // select(label), enterCustomValue,
                                          // expectValue (+ selectTrue/False,
                                          // expectTrue/False on boolean)
  editor.object                           // selectParts/selectWhole,
                                          // expectPartsSelected/WholeSelected,
                                          // plus the text-field methods for
                                          // the whole-object value
  editor.array                            // same strategy + whole-value
                                          // methods, plus addItem,
                                          // removeItem(i), selectItem(i),
                                          // expectItemCount(n)

  editor.nodeEdit.breadcrumb.clickItem(label)
  editor.nodeEdit.editor.expectExists()
  editor.nodeEdit.autoPopulationAlert.expectVisible() / .expectNotExists() / .expectText(t)
  editor.nodeEdit.description.expectInfoIcon() / .expectNoInfoIcon() / .open()
    / .close() / .expectPopoverText(t) / .expectPopoverClosed()
  editor.nodeEdit.clearButton.click() / .expectVisible() / .expectEnabled() / .expectDisabled()

  expectData(driver, data)                // asserts the saved settings' `data`

Locators are re-queried on every call, and every expectation polls, so no
explicit waits are needed between steps.
*/

import createTree from "./tree";
import createEditors from "./editors";
import createNodeEdit from "./nodeEdit";

export const createObjectEditor = (view) => ({
  tree: createTree(view),
  ...createEditors(view),
  nodeEdit: createNodeEdit(view),
});

export const expectData = (driver, data) =>
  driver.expectSettings((settings) => settings.data).toEqual(data);

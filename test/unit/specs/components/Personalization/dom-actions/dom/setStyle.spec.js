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

import setStyle from "../../../../../../../src/components/Personalization/dom-actions/dom/setStyle.js";
import {
  selectNodes,
  removeNode,
  createNode,
} from "../../../../../../../src/utils/dom/index.js";
import { getAttribute } from "../../../../../../../src/components/Personalization/dom-actions/dom/index.js";

describe("Personalization::DOM::setStyle", () => {
  afterEach(() => {
    selectNodes("#fooDivId").forEach(removeNode);
  });

  it("sets style with priority to the element", () => {
    const element = createNode("div", { id: "fooDivId" });
    setStyle(element, "padding", "15px", "important");

    const style = getAttribute(element, "style");

    expect(style).toEqual("padding: 15px !important;");
  });

  it("sets style to the element, without priority", () => {
    const element = createNode("div", { id: "fooDivId" });
    setStyle(element, "padding", "15px");

    const style = getAttribute(element, "style");

    expect(style).toEqual("padding: 15px;");
  });
});

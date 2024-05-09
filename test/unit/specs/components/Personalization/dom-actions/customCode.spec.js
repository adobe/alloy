/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  appendNode,
  createNode,
  selectNodes,
  removeNode,
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";

describe("Personalization::actions::customCode", () => {
  beforeEach(() => {
    selectNodes(".customCode").forEach(removeNode);
    delete window.someEvar123;
  });

  afterEach(() => {
    selectNodes(".customCode").forEach(removeNode);
    delete window.someEvar123;
  });

  it("should set content in container that has children", () => {
    const modules = initDomActionsModules();
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    element.innerHTML = `<div id="inner1"></div><div id="inner2"></div>`;
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p>",
      meta,
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual(
        `<p>Hola!</p><div id="inner1"></div><div id="inner2"></div>`,
      );
    });
  });

  it("should set content in container that has NO children", () => {
    const modules = initDomActionsModules();
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p><div>Hello</div>",
      meta,
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual(`<p>Hola!</p><div>Hello</div>`);
    });
  });
});

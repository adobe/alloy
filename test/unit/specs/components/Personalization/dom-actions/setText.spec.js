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
} from "../../../../../../src/utils/dom/index.js";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";

describe("Personalization::actions::setText", () => {
  beforeEach(() => {
    cleanUpDomChanges("setText");
  });

  afterEach(() => {
    cleanUpDomChanges("setText");
  });

  it("should set personalized text", () => {
    const modules = initDomActionsModules();
    const { setText } = modules;
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setText",
      prehidingSelector: "#setText",
      content: "bar",
      meta,
    };

    return setText(settings).then(() => {
      expect(elements[0].textContent).toEqual("bar");
    });
  });
});

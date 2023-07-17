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
import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUpDomChanges("move");
  });

  afterEach(() => {
    cleanUpDomChanges("move");
  });

  it("should move personalized content", () => {
    const modules = initDomActionsModules();
    const { move } = modules;
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#move",
      prehidingSelector: "#move",
      content: { left: "100px", top: "100px" },
      meta
    };

    move(settings).then(() => {
      expect(elements[0].style.left).toEqual("100px");
      expect(elements[0].style.top).toEqual("100px");
    });
  });
});

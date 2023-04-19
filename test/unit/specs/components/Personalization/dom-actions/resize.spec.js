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

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUpDomChanges("resize");
  });

  afterEach(() => {
    cleanUpDomChanges("resize");
  });

  it("should resize personalized content", () => {
    const modules = initDomActionsModules();
    const { resize } = modules;
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#resize",
      prehidingSelector: "#resize",
      content: { width: "100px", height: "100px" },
      meta
    };

    return resize(settings).then(() => {
      expect(elements[0].style.width).toEqual("100px");
      expect(elements[0].style.height).toEqual("100px");
    });
  });
});

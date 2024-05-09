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
  selectNodes,
  appendNode,
  createNode,
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";

describe("Personalization::actions::insertBefore", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  afterEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  it("should insert before personalized content", () => {
    const modules = initDomActionsModules();
    const { insertBefore } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ib" },
      { innerHTML: "AAA" },
    );
    const element = createNode("div", { id: "insertBefore" }, {}, [child]);

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ib">BBB</div>`,
      meta,
    };

    return insertBefore(settings).then(() => {
      const result = selectNodes("div#insertBefore .ib");

      expect(result[0].innerHTML).toEqual("BBB");
      expect(result[1].innerHTML).toEqual("AAA");
    });
  });
});

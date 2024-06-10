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
} from "../../../../../../src/utils/dom/index.js";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE,
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition.js";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom/index.js";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest.js";
import { DOM_ACTION_INSERT_AFTER } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::insertAfter", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("insertAfter");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_INSERT_AFTER,
    });
  });

  afterEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  it("should insert after personalized content", () => {
    const modules = initDomActionsModules();
    const { insertAfter } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ia" },
      { innerHTML: "AAA" },
    );
    const element = createNode("div", { id: "insertAfter" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ia">BBB</div><div id="c" class="ia">CCC</div>`,
      meta: { a: 1 },
    };

    return insertAfter(settings, decorateProposition).then(() => {
      const result = selectNodes("div#insertAfter .ia");

      expect(result[0].innerHTML).toEqual("AAA");
      expect(result[1].innerHTML).toEqual("BBB");
      expect(result[2].innerHTML).toEqual("CCC");

      expect(getAttribute(result[1], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(
        getAttribute(result[1], INTERACT_ID_DATA_ATTRIBUTE),
      ).not.toBeNull();
    });
  });
});

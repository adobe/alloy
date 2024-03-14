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
  selectNodes
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest";
import { DOM_ACTION_REPLACE_HTML } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules";

describe("Personalization::actions::replaceHtml", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("replaceHtml");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_REPLACE_HTML
    });
  });

  afterEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  it("should replace element with personalized content", () => {
    const modules = initDomActionsModules();
    const { replaceHtml } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "rh" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "replaceHtml" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="rh">BBB</div>`,
      meta: { a: 1 }
    };

    return replaceHtml(settings, decorateProposition).then(() => {
      const result = selectNodes("div#replaceHtml .rh");

      expect(result.length).toEqual(1);
      expect(result[0].innerHTML).toEqual("BBB");

      expect(getAttribute(result[0], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(
        getAttribute(result[0], INTERACT_ID_DATA_ATTRIBUTE)
      ).not.toBeNull();
    });
  });
});

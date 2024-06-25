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
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE,
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition.js";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom/index.js";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest.js";
import { DOM_ACTION_SET_STYLE } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::setStyle", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("setStyle");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_SET_STYLE,
    });
  });

  afterEach(() => {
    cleanUpDomChanges("setStyle");
  });

  it("should set styles", () => {
    const modules = initDomActionsModules();
    const { setStyle } = modules;
    const element = createNode("div", { id: "setStyle" });

    appendNode(document.body, element);

    const settings = {
      selector: "#setStyle",
      prehidingSelector: "#setStyle",
      content: { "font-size": "33px", priority: "important" },
      meta: { a: 1 },
    };

    return setStyle(settings, decorateProposition).then(() => {
      expect(element.style.getPropertyValue("font-size")).toEqual("33px");

      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
});

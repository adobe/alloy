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
import { beforeEach, afterEach, describe, it, expect } from "vitest";
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
import { DOM_ACTION_RESIZE } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::resize", () => {
  let decorateProposition;
  beforeEach(() => {
    cleanUpDomChanges("resize");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_RESIZE,
    });
  });
  afterEach(() => {
    cleanUpDomChanges("resize");
  });
  it("should resize personalized content", () => {
    const modules = initDomActionsModules();
    const { resize } = modules;
    const element = createNode("div", {
      id: "resize",
    });
    appendNode(document.body, element);
    const settings = {
      selector: "#resize",
      prehidingSelector: "#resize",
      content: {
        width: "100px",
        height: "100px",
      },
      meta: {
        a: 1,
      },
    };
    return resize(settings, decorateProposition).then(() => {
      expect(element.style.width).toEqual("100px");
      expect(element.style.height).toEqual("100px");
      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
  it("should resize personalized content even if dimensions are not properly formatted", () => {
    const modules = initDomActionsModules();
    const { resize } = modules;
    const element = createNode("div", {
      id: "resize",
    });
    appendNode(document.body, element);
    const settings = {
      selector: "#resize",
      prehidingSelector: "#resize",
      content: {
        width: "100",
        height: "100",
      },
      meta: {
        a: 1,
      },
    };
    return resize(settings, decorateProposition).then(() => {
      expect(element.style.width).toEqual("100px");
      expect(element.style.height).toEqual("100px");
      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
});

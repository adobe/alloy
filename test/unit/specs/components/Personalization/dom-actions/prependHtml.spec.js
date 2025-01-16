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
import { DOM_ACTION_PREPEND_HTML } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::prependHtml", () => {
  let decorateProposition;
  beforeEach(() => {
    cleanUpDomChanges("prependHtml");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_PREPEND_HTML,
    });
  });
  afterEach(() => {
    cleanUpDomChanges("prependHtml");
  });
  it("should prepend personalized content", () => {
    const modules = initDomActionsModules();
    const { prependHtml } = modules;
    const content = `<li>3</li>`;
    const element = createNode(
      "ul",
      {
        id: "prependHtml",
      },
      {
        innerHTML: content,
      },
    );
    appendNode(document.body, element);
    const settings = {
      selector: "#prependHtml",
      prehidingSelector: "#prependHtml",
      content: `<li>1</li><li>2</li>`,
      meta: {
        a: 1,
      },
    };
    return prependHtml(settings, decorateProposition).then(() => {
      const result = selectNodes("ul#prependHtml li");
      expect(result.length).toEqual(3);
      // first li (prepended)
      expect(result[0].innerHTML).toEqual("1");
      expect(getAttribute(result[0], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(
        getAttribute(result[0], INTERACT_ID_DATA_ATTRIBUTE),
      ).not.toBeNull();

      // second li (prepended)
      expect(result[1].innerHTML).toEqual("2");
      expect(getAttribute(result[1], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(
        getAttribute(result[1], INTERACT_ID_DATA_ATTRIBUTE),
      ).not.toBeNull();

      // third li (pre-existing)
      expect(result[2].innerHTML).toEqual("3");
      expect(getAttribute(result[2], CLICK_LABEL_DATA_ATTRIBUTE)).toBeNull();
      expect(getAttribute(result[2], INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
    });
  });
});

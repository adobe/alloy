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
import { DOM_ACTION_APPEND_HTML } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::appendHtml", () => {
  let decorateProposition;
  beforeEach(() => {
    cleanUpDomChanges("appendHtml");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_APPEND_HTML,
    });
  });
  afterEach(() => {
    cleanUpDomChanges("appendHtml");
  });
  it("should append personalized content", () => {
    const modules = initDomActionsModules();
    const { appendHtml } = modules;
    const element = createNode(
      "ul",
      {
        id: "appendHtml",
      },
      {
        innerHTML: "<li>1</li>",
      },
    );
    appendNode(document.body, element);
    const settings = {
      selector: "#appendHtml",
      prehidingSelector: "#appendHtml",
      content: `<li>2</li><li>3</li>`,
      meta: {
        a: 1,
      },
    };
    return appendHtml(settings, decorateProposition).then(() => {
      const result = selectNodes("ul#appendHtml li");
      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel",
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
});

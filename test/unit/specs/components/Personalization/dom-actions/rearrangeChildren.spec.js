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
import { DOM_ACTION_REARRANGE } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules";

describe("Personalization::actions::rearrange", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("rearrange");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_REARRANGE
    });
  });

  afterEach(() => {
    cleanUpDomChanges("rearrange");
  });

  it("should rearrange elements when from < to", () => {
    const modules = initDomActionsModules();
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 0, to: 2 },
      meta: { a: 1 }
    };

    return rearrange(settings, decorateProposition).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("2");
      expect(getAttribute(result[0], CLICK_LABEL_DATA_ATTRIBUTE)).toBeNull();
      expect(getAttribute(result[0], INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();

      expect(result[1].textContent).toEqual("3");
      expect(getAttribute(result[1], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(
        getAttribute(result[1], INTERACT_ID_DATA_ATTRIBUTE)
      ).not.toBeNull();

      expect(result[2].textContent).toEqual("1");
      expect(getAttribute(result[2], CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(
        getAttribute(result[2], INTERACT_ID_DATA_ATTRIBUTE)
      ).not.toBeNull();
    });
  });

  it("should rearrange elements when from > to", () => {
    const modules = initDomActionsModules();
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 2, to: 0 },
      meta: { a: 1 }
    };

    return rearrange(settings, decorateProposition).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("3");
      expect(result[1].textContent).toEqual("1");
      expect(result[2].textContent).toEqual("2");
    });
  });
});

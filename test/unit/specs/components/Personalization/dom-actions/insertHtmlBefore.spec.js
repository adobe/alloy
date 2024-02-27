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
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import createDecorateProposition, {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";

describe("Personalization::actions::insertBefore", () => {
  let storeClickMeta;
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("insertBefore");
    ({ storeClickMeta } = createClickStorage());
    decorateProposition = createDecorateProposition(
      "propositionID",
      "itemId",
      "trackingLabel",
      "page",
      {
        id: "notifyId",
        scope: "web://mywebsite.com",
        scopeDetails: { something: true }
      },
      storeClickMeta
    );
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
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertBefore" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ib">BBB</div>`,
      meta: { a: 1 }
    };

    return insertBefore(settings, decorateProposition).then(() => {
      const [insertedElement, existingElement] = selectNodes(
        "div#insertBefore .ib"
      );

      expect(insertedElement.innerHTML).toEqual("BBB");
      expect(getAttribute(insertedElement, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(
        getAttribute(insertedElement, INTERACT_ID_DATA_ATTRIBUTE)
      ).not.toBeNull();

      expect(existingElement.innerHTML).toEqual("AAA");
      expect(
        getAttribute(existingElement, INTERACT_ID_DATA_ATTRIBUTE)
      ).toBeNull();
    });
  });
});

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
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import createDecorateProposition, {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";

describe("Personalization::actions::move", () => {
  let storeClickMeta;
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("move");
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
    cleanUpDomChanges("move");
  });

  it("should move personalized content", () => {
    const modules = initDomActionsModules();
    const { move } = modules;
    const element = createNode("div", { id: "move" });

    appendNode(document.body, element);

    const settings = {
      selector: "#move",
      prehidingSelector: "#move",
      content: { left: "100px", top: "100px" },
      meta: { a: 1 }
    };

    move(settings, decorateProposition).then(() => {
      expect(element.style.left).toEqual("100px");
      expect(element.style.top).toEqual("100px");

      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
});

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

describe("Personalization::actions::setAttribute", () => {
  let storeClickMeta;
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("setAttribute");
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
    cleanUpDomChanges("setAttribute");
  });

  it("should set element attribute", () => {
    const modules = initDomActionsModules();
    const { setAttribute } = modules;
    const element = createNode("div", { id: "setAttribute" });

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setAttribute",
      prehidingSelector: "#setAttribute",
      content: { "data-test": "bar" },
      meta
    };

    return setAttribute(settings, decorateProposition).then(() => {
      expect(element.getAttribute("data-test")).toEqual("bar");

      expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        "trackingLabel"
      );
      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
    });
  });
});

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
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import createDecorateProposition from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";

describe("Personalization::actions::remove", () => {
  let storeClickMeta;
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("remove");
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
    cleanUpDomChanges("remove");
  });

  it("should remove element", () => {
    const modules = initDomActionsModules();
    const { remove } = modules;
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#remove",
      prehidingSelector: "#remove",
      meta
    };

    return remove(settings, decorateProposition).then(() => {
      const result = selectNodes("#child");

      expect(result.length).toEqual(0);
    });
  });
});

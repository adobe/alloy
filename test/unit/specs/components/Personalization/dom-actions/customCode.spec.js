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
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import createDecorateProposition from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::customCode", () => {
  let storeClickMeta;
  let decorateProposition;
  let customCode;
  let element;

  beforeEach(() => {
    cleanUpDomChanges("customCode");
    delete window.someEvar123;

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

    const modules = initDomActionsModules();
    ({ customCode } = modules);
  });

  afterEach(() => {
    cleanUpDomChanges("customCode");
    delete window.someEvar123;
  });

  it("should set content in container that has children", async () => {
    element = createNode("div", { id: "customCode", class: "customCode" });
    element.innerHTML = `<div id="inner1"></div><div id="inner2"></div>`;
    appendNode(document.body, element);

    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p>",
      meta: { a: 1 }
    };

    await customCode(settings, decorateProposition);
    expect(element.innerHTML).toMatch(
      /<p data-aep-interact-id="\d+" data-aep-click-label="trackingLabel">Hola!<\/p><div id="inner1"><\/div><div id="inner2"><\/div>/
    );
  });

  it("should set content in container that has NO children", async () => {
    element = createNode("div", { id: "customCode", class: "customCode" });
    appendNode(document.body, element);

    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p><div>Hello</div>",
      meta: { a: 1 }
    };

    await customCode(settings, decorateProposition);
    expect(element.innerHTML).toMatch(
      /<p data-aep-interact-id="\d+" data-aep-click-label="trackingLabel">Hola!<\/p><div data-aep-interact-id="\d+" data-aep-click-label="trackingLabel">Hello<\/div>/
    );
  });
});

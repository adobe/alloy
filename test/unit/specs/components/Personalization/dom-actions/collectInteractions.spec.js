/*
Copyright 2024 Adobe. All rights reserved.
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
import { INTERACT_ID_DATA_ATTRIBUTE } from "../../../../../../src/components/Personalization/handlers/createDecorateProposition.js";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom/index.js";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest.js";
import { DOM_ACTION_COLLECT_INTERACTIONS } from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";

describe("Personalization::actions::collectInteractions", () => {
  let decorateProposition;
  beforeEach(() => {
    cleanUpDomChanges("something");
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_COLLECT_INTERACTIONS,
    });
  });
  afterEach(() => {
    cleanUpDomChanges("something");
  });
  it("should decorate element", async () => {
    const itemData = {
      isCool: true,
      selector: "#something",
    };
    const modules = initDomActionsModules();
    const element = createNode("div", {
      id: "something",
    });
    appendNode(document.body, element);
    await modules[DOM_ACTION_COLLECT_INTERACTIONS](
      itemData,
      decorateProposition,
    );
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });
});

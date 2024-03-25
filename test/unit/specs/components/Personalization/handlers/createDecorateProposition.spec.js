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
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest";
import {
  DOM_ACTION_CLICK,
  DOM_ACTION_SET_HTML
} from "../../../../../../src/components/Personalization/dom-actions/initDomActionsModules";

describe("Personalization::createDecorateProposition", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("something");
  });

  afterEach(() => {
    cleanUpDomChanges("something");
  });

  it("sets a data-attribute for interact id and label", () => {
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_CLICK,
      trackingLabel: "myTrackingLabel"
    });

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("does not set a data-attribute for label if no label is specified", () => {
    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_CLICK,
      trackingLabel: null
    });

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toBeNull();
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("reuses interact ids when one is already present on an element", () => {
    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_CLICK,
      itemId: "itemId1",
      trackingLabel: "myTrackingLabel"
    });
    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );
    const interactId = getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE);
    expect(interactId).not.toBeNull();

    decorateProposition = createDecoratePropositionForTest({
      type: DOM_ACTION_CLICK,
      itemId: "itemId2",
      trackingLabel: "myOtherTrackingLabel"
    });
    decorateProposition(element);

    // tracking label remains the same despite another item targeting the same element with trackingLabel set to "myOtherTrackingLabel" (first one wins)
    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );

    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toEqual(
      interactId
    );
  });

  it("provides a unique interact id for each element", () => {
    const element = createNode(
      "div",
      { id: "something" },
      {
        innerHTML:
          "<li class='one'>one</li><li class='two'>two</li><li class='three'>three</li>"
      }
    );
    appendNode(document.body, element);

    const interactIds = new Set();

    ["one", "two", "three"].forEach((value, idx) => {
      decorateProposition = createDecoratePropositionForTest({
        type: DOM_ACTION_CLICK,
        propositionId: `propId_${value}`,
        itemId: `itemId_${idx}`,
        trackingLabel: `trackingLabel${value}`,
        notification: {
          id: `notifyId${idx}`,
          scope: "web://mywebsite.com",
          scopeDetails: { something: true }
        }
      });
      const li = document.querySelector(`#something .${value}`);
      decorateProposition(li);

      expect(getAttribute(li, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        `trackingLabel${value}`
      );
      const interactId = getAttribute(li, INTERACT_ID_DATA_ATTRIBUTE);
      expect(interactId).not.toBeNull();

      interactIds.add(interactId);
    });
    expect(interactIds.size).toEqual(3);
  });

  it("does not set data-attribute for interact id and label if autoTrackPropositionInteractions does not include the appropriate decisionProvider and dom action is not 'click'", () => {
    decorateProposition = createDecoratePropositionForTest({
      autoTrackPropositionInteractions: ["MOO"],
      type: DOM_ACTION_SET_HTML,
      trackingLabel: "myTrackingLabel"
    });

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toBeNull();
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
  });

  it("sets data-attribute for interact id and label for all 'click' dom actions, regardless of autoTrackPropositionInteractions", () => {
    decorateProposition = createDecoratePropositionForTest({
      autoTrackPropositionInteractions: ["MOO"],
      type: DOM_ACTION_CLICK,
      trackingLabel: "myTrackingLabel"
    });

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });
});

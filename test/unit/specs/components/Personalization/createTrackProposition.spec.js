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
import createTrackProposition from "../../../../../src/components/Personalization/createTrackProposition";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET
} from "../../../../../src/constants/decisionProvider";
import {
  ALWAYS,
  NEVER
} from "../../../../../src/constants/propositionInteractionType";
import createInteractionStorage from "../../../../../src/components/Personalization/createInteractionStorage";
import {
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  JSON_CONTENT_ITEM,
  HTML_CONTENT_ITEM,
  MEASUREMENT_SCHEMA,
  MESSAGE_FEED_ITEM,
  MESSAGE_IN_APP,
  MESSAGE_NATIVE_ALERT,
  REDIRECT_ITEM,
  RULESET_ITEM
} from "../../../../../src/constants/schema";
import createMockProposition from "../../../helpers/createMockProposition";
import cleanUpDomChanges from "../../../helpers/cleanUpDomChanges";
import { appendNode, createNode } from "../../../../../src/utils/dom";
import { getAttribute } from "../../../../../src/components/Personalization/dom-actions/dom";
import { INTERACT_ID_DATA_ATTRIBUTE } from "../../../../../src/components/Personalization/handlers/createDecorateProposition";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition";

describe("Personalization:trackProposition", () => {
  const testElementId = "superfluous123";

  let autoTrackPropositionInteractions;
  const { storeInteractionMeta } = createInteractionStorage();
  let trackProposition;

  const createProposition = injectCreateProposition({
    preprocess: data => data,
    isPageWideSurface: () => false
  });

  beforeEach(() => {
    autoTrackPropositionInteractions = {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER
    };

    trackProposition = createTrackProposition({
      autoTrackPropositionInteractions,
      storeInteractionMeta,
      createProposition
    });

    const element = createNode("div", {
      id: testElementId,
      class: `test-element-${testElementId}`
    });
    element.innerHTML = "test element";
    appendNode(document.body, element);
  });

  afterEach(() => {
    cleanUpDomChanges(testElementId);
  });

  it("has a command defined", () => {
    const { command } = trackProposition;

    expect(command).toEqual({
      optionsValidator: jasmine.any(Function),
      run: jasmine.any(Function)
    });
  });

  it("decorates element for html-content-item", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: HTML_CONTENT_ITEM,
      data: "<div>hello world</div>"
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON(),
        selector: `#${testElementId}`
      })
    ).toBeResolved();

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("decorates element for json-content-item", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON(),
        selector: `#${testElementId}`
      })
    ).toBeResolved();

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("decorates element using element reference instead of selector", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    const element = document.getElementById(testElementId);
    await expectAsync(
      command.run({ proposition: proposition.toJSON(), element })
    ).toBeResolved();

    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("does not decorate elements for non-code-based schemas", () => {
    const { command } = trackProposition;

    [
      DEFAULT_CONTENT_ITEM,
      DOM_ACTION,
      RULESET_ITEM,
      REDIRECT_ITEM,
      MESSAGE_IN_APP,
      MESSAGE_FEED_ITEM,
      MESSAGE_NATIVE_ALERT,
      MEASUREMENT_SCHEMA
    ].forEach(schema => {
      const proposition = createMockProposition({
        id: "abc",
        schema,
        data: undefined
      });

      const element = document.getElementById(testElementId);
      command.run({ proposition: proposition.toJSON(), element });

      expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
    });
  });

  it("fails gracefully when no element or selector specified", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON()
      })
    ).toBeRejectedWithError("Invalid DOM element!");

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
  });

  it("fails gracefully invalid element specified", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON(),
        element: {}
      })
    ).toBeRejectedWithError("Invalid DOM element!");

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
  });

  it("fails gracefully when invalid selector specified", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON(),
        selector: ".splendid"
      })
    ).toBeRejectedWithError("Invalid DOM element!");

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
  });

  it("fails gracefully selector lookup fails", async () => {
    const { command } = trackProposition;

    const proposition = createMockProposition({
      id: "abc",
      schema: JSON_CONTENT_ITEM,
      data: { word: "up" }
    });

    await expectAsync(
      command.run({
        proposition: proposition.toJSON(),
        selector: ""
      })
    ).toBeRejectedWithError("Invalid DOM element!");

    const element = document.getElementById(testElementId);
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toBeNull();
  });

  it("fails gracefully if malformed proposition json", async () => {
    const { command } = trackProposition;

    const scopeDetails = { decisionProvider: "AJO" };

    const element = document.getElementById(testElementId);
    await expectAsync(
      command.run({ proposition: {}, element })
    ).toBeRejectedWithError('Proposition object is missing "id" field');

    await expectAsync(
      command.run({ proposition: { id: 1 }, element })
    ).toBeRejectedWithError('Proposition object is missing "scope" field');

    await expectAsync(
      command.run({
        proposition: { id: 1, scope: "web://aepdemo.com/" },
        element
      })
    ).toBeRejectedWithError(
      'Proposition object is missing "scopeDetails" field'
    );

    await expectAsync(
      command.run({
        proposition: { id: 1, scope: "web://aepdemo.com/", scopeDetails },
        element
      })
    ).toBeRejectedWithError('Proposition object is missing "items" field');

    await expectAsync(
      command.run({
        proposition: {
          id: 1,
          scope: "web://aepdemo.com/",
          scopeDetails,
          items: undefined
        },
        element
      })
    ).toBeRejectedWithError("Proposition items must be an Array");

    await expectAsync(
      command.run({
        proposition: {
          id: 1,
          scope: "web://aepdemo.com/",
          scopeDetails,
          items: [{}]
        },
        element
      })
    ).toBeRejectedWithError('Proposition item is missing "id" field');

    await expectAsync(
      command.run({
        proposition: {
          id: 1,
          scope: "web://aepdemo.com/",
          scopeDetails,
          items: [{ id: "abc" }]
        },
        element
      })
    ).toBeRejectedWithError('Proposition item is missing "schema" field');

    await expectAsync(
      command.run({
        proposition: {
          id: 1,
          scope: "web://aepdemo.com/",
          scopeDetails,
          items: [{ id: "abc", schema: JSON_CONTENT_ITEM }]
        },
        element
      })
    ).toBeRejectedWithError('Proposition item is missing "data" field');

    await expectAsync(
      command.run({
        proposition: {
          id: 1,
          scope: "web://aepdemo.com/",
          scopeDetails,
          items: [{ id: "abc", schema: JSON_CONTENT_ITEM, data: {} }]
        },
        element
      })
    ).not.toBeRejected();
  });
});

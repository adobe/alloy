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
import createProcessDomAction from "../../../../../../src/components/Personalization/handlers/createProcessDomAction.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";
import {
  appendNode,
  createNode,
} from "../../../../../../src/utils/dom/index.js";
import { DOM_ACTION } from "../../../../../../src/constants/schema.js";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../../../../src/constants/decisionProvider.js";
import {
  ALWAYS,
  NEVER,
} from "../../../../../../src/constants/propositionInteractionType.js";
import createMockProposition from "../../../../helpers/createMockProposition.js";

describe("createProcessDomAction", () => {
  let modules;
  let logger;
  let storeInteractionMeta;
  let storeClickMeta;
  let processDomAction;

  beforeEach(() => {
    cleanUpDomChanges("click-element");

    modules = {
      typeA: jasmine.createSpy("typeA"),
      typeB: jasmine.createSpy("typeB"),
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
    storeInteractionMeta = jasmine.createSpy("storeInteractionMeta");
    storeClickMeta = jasmine.createSpy("storeClickMeta");

    processDomAction = createProcessDomAction({
      modules,
      logger,
      storeInteractionMeta,
      storeClickMeta,
      autoCollectPropositionInteractions: {
        [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
        [ADOBE_TARGET]: NEVER,
      },
    });
  });

  afterEach(() => {
    cleanUpDomChanges("click-element");
  });

  it("returns an empty object if the item has no data, and logs missing type", () => {
    const proposition = createMockProposition({
      schema: DOM_ACTION,
      data: undefined,
    });

    expect(processDomAction(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing type.",
      undefined,
    );
  });

  it("returns an empty object if the item has no type, and logs missing type", () => {
    const proposition = createMockProposition({
      schema: DOM_ACTION,
      data: {},
    });
    expect(processDomAction(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing type.",
      {},
    );
  });

  it("returns an empty object if the item has an unknown type, and logs unknown type", () => {
    const proposition = createMockProposition({
      schema: DOM_ACTION,
      data: { type: "typeC" },
    });
    expect(processDomAction(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: unknown type.",
      {
        type: "typeC",
      },
    );
  });

  it("returns an empty object if the item has no selector for a click type, and logs missing selector", () => {
    const proposition = createMockProposition({
      schema: DOM_ACTION,
      data: { type: "click" },
    });
    expect(processDomAction(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing selector.",
      {
        type: "click",
      },
    );
  });

  it("handles a click type", async () => {
    const element = createNode("div", {
      id: "click-element",
      class: "click-element",
    });
    element.innerHTML = "click element";
    appendNode(document.body, element);

    const proposition = createMockProposition(
      {
        id: "itemId",
        schema: DOM_ACTION,
        data: { type: "click", selector: ".click-element" },
        characteristics: {
          trackingLabel: "mytrackinglabel",
        },
      },
      {
        characteristics: {
          scopeType: "page",
          trackingLabel: "mytrackinglabel",
        },
      },
    );
    const clickAction = processDomAction(proposition.getItems()[0]);

    expect(clickAction).toEqual({
      setRenderAttempted: true,
      includeInNotification: false,
    });

    expect(storeInteractionMeta).not.toHaveBeenCalled();
    expect(storeClickMeta).toHaveBeenCalledWith({
      selector: ".click-element",
      meta: {
        id: "id",
        scope: "scope",
        scopeDetails: {
          decisionProvider: "AJO",
          characteristics: {
            scopeType: "page",
            trackingLabel: "mytrackinglabel",
          },
        },
        trackingLabel: "mytrackinglabel",
        scopeType: "proposition",
      },
    });
  });

  it("handles a non-click known type", () => {
    const proposition = createMockProposition({
      schema: DOM_ACTION,
      data: { type: "typeA", a: "b" },
    });
    const result = processDomAction(proposition.getItems()[0]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      setRenderAttempted: true,
      includeInNotification: true,
    });
    expect(modules.typeA).not.toHaveBeenCalled();
    result.render();
    expect(modules.typeA).toHaveBeenCalledWith(
      { type: "typeA", a: "b" },
      jasmine.any(Function),
    );
  });
});

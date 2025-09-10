/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { vi, beforeEach, describe, it, expect } from "vitest";
import createOnClickHandler from "../../../../../src/components/Personalization/createOnClickHandler.js";
import { mergeDecisionsMeta } from "../../../../../src/utils/event.js";
import createEvent from "../../../../../src/core/createEvent.js";
import { createNode } from "../../../../../src/utils/dom/index.js";
import {
  ALWAYS,
  NEVER,
} from "../../../../../src/constants/propositionInteractionType.js";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../../../src/constants/decisionProvider.js";

describe("Personalization::createOnClickHandler", () => {
  let collectInteractions;
  let collectClicks;
  let getInteractionMetas;
  let getClickMetas;
  let getClickSelectors;
  let event;
  const decisionsMeta = [
    {
      id: 1,
      scope: "foo",
    },
  ];
  const decisionsMeta2 = [
    {
      id: 2,
      scope: "bar",
    },
  ];
  let autoCollectPropositionInteractions;
  beforeEach(() => {
    collectInteractions = vi.fn();
    collectClicks = vi.fn();
    getInteractionMetas = vi.fn();
    getClickMetas = vi.fn();
    getClickSelectors = vi.fn();
    event = createEvent();
    vi.spyOn(event, "mergeXdm");
    autoCollectPropositionInteractions = {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER,
    };
  });
  it("collects clicks", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.mockReturnValue({
      decisionsMeta: [],
    });
    collectClicks.mockReturnValue({
      decisionsMeta,
      eventLabel: "",
    });
    getClickSelectors.mockReturnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = "foo";
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("collects interactions", () => {
    collectClicks.mockReturnValue({
      decisionsMeta: [],
    });
    collectInteractions.mockReturnValue({
      decisionsMeta,
      propositionActionLabel: "",
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas,
      autoCollectPropositionInteractions,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("collects clicks with label", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.mockReturnValue({
      decisionsMeta: [],
    });
    collectClicks.mockReturnValue({
      decisionsMeta,
      propositionActionLabel: "click-label",
    });
    getClickSelectors.mockReturnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = "foo";
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
          propositionAction: {
            label: "click-label",
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("collects interactions with label", () => {
    collectClicks.mockReturnValue({
      decisionsMeta: [],
    });
    collectInteractions.mockReturnValue({
      decisionsMeta,
      propositionActionLabel: "click-label",
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
          propositionAction: {
            label: "click-label",
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas,
      autoCollectPropositionInteractions,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });

  // TODO collect clicks with token ??

  it("collects interactions with token", () => {
    collectClicks.mockReturnValue({
      decisionsMeta: [],
    });
    collectInteractions.mockReturnValue({
      decisionsMeta,
      propositionActionToken: "click-token",
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
          propositionAction: {
            tokens: ["click-token"],
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas,
      autoCollectPropositionInteractions,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("shouldn't be called when clickStorage and interactionStorage are empty", () => {
    collectInteractions.mockReturnValue({
      decisionsMeta: [],
    });
    collectClicks.mockReturnValue({
      decisionsMeta: [],
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    expect(event.mergeXdm).not.toHaveBeenCalled();
  });
  it("for interactions, adds a viewName to the response", () => {
    collectClicks.mockReturnValue({
      decisionsMeta: [],
    });
    collectInteractions.mockReturnValue({
      decisionsMeta,
      viewName: "myview",
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      web: {
        webPageDetails: {
          viewName: "myview",
        },
      },
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas,
      autoCollectPropositionInteractions,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("for clicks, adds a viewName to the response", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.mockReturnValue({
      decisionsMeta: [],
    });
    collectClicks.mockReturnValue({
      decisionsMeta,
      viewName: "myview",
    });
    getClickSelectors.mockReturnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = "foo";
    handleOnClick({
      event,
      clickedElement,
    });
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      web: {
        webPageDetails: {
          viewName: "myview",
        },
      },
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
  it("gets metas for both click and interact", () => {
    collectInteractions.mockReturnValue({
      decisionsMeta,
    });
    collectClicks.mockReturnValue({
      decisionsMeta: decisionsMeta2,
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const clickedElement = createNode("div", {
      class: "clicked-element",
    });
    handleOnClick({
      event,
      clickedElement,
    });
    expect(collectInteractions).toHaveBeenCalled();
    expect(collectClicks).toHaveBeenCalled();
    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo",
            },
            {
              id: 2,
              scope: "bar",
            },
          ],
          propositionEventType: {
            interact: 1,
          },
        },
      },
    };
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas,
      autoCollectPropositionInteractions,
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm,
    });
  });
});

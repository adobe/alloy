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
import createOnClickHandler from "../../../../../src/components/Personalization/createOnClickHandler";
import { mergeDecisionsMeta } from "../../../../../src/components/Personalization/event";
import createEvent from "../../../../../src/core/createEvent";
import { createNode } from "../../../../../src/utils/dom";

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
      scope: "foo"
    }
  ];
  const decisionsMeta2 = [
    {
      id: 2,
      scope: "bar"
    }
  ];
  beforeEach(() => {
    collectInteractions = jasmine.createSpy("collectInteractions");
    collectClicks = jasmine.createSpy("collectClicks");

    getInteractionMetas = jasmine.createSpy("getInteractionMetas");
    getClickMetas = jasmine.createSpy("getInteractionMetas");

    getClickSelectors = jasmine.createSpy("getClickSelectors");

    event = createEvent();
    spyOn(event, "mergeXdm").and.callThrough();
  });

  it("collects clicks", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.and.returnValue({ decisionsMeta: [] });
    collectClicks.and.returnValue({
      decisionsMeta,
      eventLabel: ""
    });

    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });

    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("collects interactions", () => {
    collectClicks.and.returnValue({ decisionsMeta: [] });
    collectInteractions.and.returnValue({
      decisionsMeta,
      propositionActionLabel: ""
    });

    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("collects clicks with label", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.and.returnValue({ decisionsMeta: [] });
    collectClicks.and.returnValue({
      decisionsMeta,
      propositionActionLabel: "click-label"
    });
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          },
          propositionAction: {
            label: "click-label"
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("collects interactions with label", () => {
    collectClicks.and.returnValue({ decisionsMeta: [] });
    collectInteractions.and.returnValue({
      decisionsMeta,
      propositionActionLabel: "click-label"
    });

    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          },
          propositionAction: {
            label: "click-label"
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  // TODO collect clicks with token ??

  it("collects interactions with token", () => {
    collectClicks.and.returnValue({ decisionsMeta: [] });
    collectInteractions.and.returnValue({
      decisionsMeta,
      propositionActionToken: "click-token"
    });

    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          },
          propositionAction: {
            tokens: ["click-token"]
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("shouldn't be called when clickStorage and interactionStorage are empty", () => {
    collectInteractions.and.returnValue({ decisionsMeta: [] });
    collectClicks.and.returnValue({ decisionsMeta: [] });

    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    expect(event.mergeXdm).not.toHaveBeenCalled();
  });

  it("for interactions, adds a viewName to the response", () => {
    collectClicks.and.returnValue({ decisionsMeta: [] });
    collectInteractions.and.returnValue({
      decisionsMeta,
      viewName: "myview"
    });
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      web: {
        webPageDetails: {
          viewName: "myview"
        }
      },
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("for clicks, adds a viewName to the response", () => {
    const selectors = ["foo", "foo2"];
    collectInteractions.and.returnValue({ decisionsMeta: [] });
    collectClicks.and.returnValue({
      decisionsMeta,
      viewName: "myview"
    });
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      web: {
        webPageDetails: {
          viewName: "myview"
        }
      },
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            }
          ],
          propositionEventType: {
            interact: 1
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("gets metas for both click and interact", () => {
    collectInteractions.and.returnValue({
      decisionsMeta
    });

    collectClicks.and.returnValue({
      decisionsMeta: decisionsMeta2
    });

    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors
    });
    const clickedElement = createNode("div", { class: "clicked-element" });

    handleOnClick({ event, clickedElement });

    expect(collectInteractions).toHaveBeenCalled();
    expect(collectClicks).toHaveBeenCalled();

    const expectedXdm = {
      eventType: "decisioning.propositionInteract",
      _experience: {
        decisioning: {
          propositions: [
            {
              id: 1,
              scope: "foo"
            },
            {
              id: 2,
              scope: "bar"
            }
          ],
          propositionEventType: {
            interact: 1
          }
        }
      }
    };

    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdm);
    expect(collectInteractions).toHaveBeenCalledWith(
      clickedElement,
      getInteractionMetas
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });
});

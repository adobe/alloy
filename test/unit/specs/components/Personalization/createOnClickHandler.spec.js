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

describe("Personalization::createOnClickHandler", () => {
  let collectClicks;
  let getClickSelectors;
  let getClickMetasBySelector;
  let event;
  const decisionsMeta = [
    {
      id: 1,
      scope: "foo"
    }
  ];
  beforeEach(() => {
    collectClicks = jasmine
      .createSpy("collectClicks")
      .and.returnValue({ decisionsMeta });
    event = createEvent();
    spyOn(event, "mergeXdm").and.callThrough();
    getClickSelectors = jasmine.createSpy("getClickSelectors");
    getClickMetasBySelector = jasmine.createSpy("getClickMetasBySelector");
  });

  it("collects clicks", () => {
    const selectors = ["foo", "foo2"];
    collectClicks.and.returnValue({
      decisionsMeta,
      eventLabel: ""
    });
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
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
      getClickMetasBySelector
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("collects clicks with label", () => {
    const selectors = ["foo", "foo2"];
    collectClicks.and.returnValue({
      decisionsMeta,
      eventLabel: "click-label"
    });
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
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
      getClickMetasBySelector
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });

  it("collects clicks shouldn't be called when clickStorage is empty", () => {
    getClickSelectors.and.returnValue([]);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
    });
    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    expect(event.mergeXdm).not.toHaveBeenCalled();
    expect(collectClicks).not.toHaveBeenCalled();
  });

  it("adds a viewName to the response", () => {
    const selectors = ["foo", "foo2"];
    collectClicks.and.returnValue({
      decisionsMeta,
      viewName: "myview"
    });
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
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
      getClickMetasBySelector
    );
    event.finalize();
    expect(event.toJSON()).toEqual({
      xdm: expectedXdm
    });
  });
});

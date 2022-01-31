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
import { DECISIONING_PROPOSITION_INTERACT } from "../../../../../src/components/Personalization/constants/eventType";

describe("Personalization::createOnClickHandler", () => {
  let mergeDecisionsMeta;
  let collectClicks;
  let getClickSelectors;
  let getClickMetasBySelector;
  const event = {};
  const decisionsMeta = [
    {
      id: 1,
      scope: "foo"
    }
  ];
  beforeEach(() => {
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
    collectClicks = jasmine
      .createSpy("collectClicks")
      .and.returnValue(decisionsMeta);
    event.mergeXdm = jasmine.createSpy("mergeXdm");
    event.mergeMeta = jasmine.createSpy("mergeMeta");
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
    collectClicks = jasmine
      .createSpy("collectClicks")
      .and.returnValue(decisionsMeta);
    getClickSelectors = jasmine.createSpy("getClickSelectors");
    getClickMetasBySelector = jasmine.createSpy("getClickMetasBySelector");
  });

  it("collects clicks", () => {
    const selectors = ["foo", "foo2"];
    collectClicks.and.returnValue(decisionsMeta);
    getClickSelectors.and.returnValue(selectors);
    const handleOnClick = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
    });
    const clickedElement = "foo";

    handleOnClick({ event, clickedElement });

    expect(event.mergeXdm).toHaveBeenCalledWith({
      eventType: DECISIONING_PROPOSITION_INTERACT
    });
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(event, decisionsMeta);
    expect(collectClicks).toHaveBeenCalledWith(
      clickedElement,
      selectors,
      getClickMetasBySelector
    );
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
    expect(mergeDecisionsMeta).not.toHaveBeenCalled();
    expect(collectClicks).not.toHaveBeenCalled();
  });
});

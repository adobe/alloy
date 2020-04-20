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

import {
  PAGE_WIDE_SCOPE_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
} from "./responsesMock/eventResponses";
import createOnResponseHandler from "../../../../../src/components/Personalization/createOnResponseHandler";

describe("Personalization::onResponseHandler", () => {
  const response = {};
  const renderableDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;
  const decisions = PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS;
  const unprocessedDecisions = PAGE_WIDE_SCOPE_DECISIONS;
  let extractDecisions;
  let executeDecisions;
  let showContainers;

  beforeEach(() => {
    extractDecisions = jasmine
      .createSpy("extractDecisions")
      .and.returnValue([renderableDecisions, decisions, unprocessedDecisions]);
    executeDecisions = jasmine.createSpy("executeDecisions");
    showContainers = jasmine.createSpy("showContainers");
  });

  it("should execute DOM ACTION decisions and return rest of decisions when renderDecisions is true", () => {
    const expectedResult = {
      decisions
    };
    const renderDecisions = true;
    const onResponse = createOnResponseHandler({
      extractDecisions,
      executeDecisions,
      showContainers
    });

    const result = onResponse({ renderDecisions, response });

    expect(extractDecisions).toHaveBeenCalledWith(response);
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(renderableDecisions);
    expect(result).toEqual(expectedResult);
  });

  it("should not trigger executeDecisions, but should return all decisions when renderDecisions is false", () => {
    const expectedResult = {
      decisions: unprocessedDecisions
    };
    const renderDecisions = false;
    const onResponse = createOnResponseHandler({
      extractDecisions,
      executeDecisions,
      showContainers
    });

    const result = onResponse({ renderDecisions, response });

    expect(extractDecisions).toHaveBeenCalledWith(response);
    expect(showContainers).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });
});

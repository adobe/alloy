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
  CART_VIEW_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS,
  PRODUCTS_VIEW_DECISIONS
} from "./responsesMock/eventResponses";
import createOnResponseHandler from "../../../../../src/components/Personalization/createOnResponseHandler";

describe("Personalization::onResponseHandler", () => {
  const renderableDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS.concat(
    CART_VIEW_DECISIONS,
    PRODUCTS_VIEW_DECISIONS
  );
  const viewDecisions = CART_VIEW_DECISIONS.concat(PRODUCTS_VIEW_DECISIONS);
  const nonRenderableDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS;
  const unprocessedDecisions = PAGE_WIDE_SCOPE_DECISIONS.concat(
    CART_VIEW_DECISIONS,
    PRODUCTS_VIEW_DECISIONS
  );
  const pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;

  let storeViews;
  let extractRenderableDecisions;
  let extractPageWideScopeDecisions;
  let executeDecisions;
  let showContainers;
  let response;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    executeDecisions = jasmine.createSpy("executeDecisions");
    showContainers = jasmine.createSpy("showContainers");
    storeViews = jasmine.createSpy("storeView");
    extractRenderableDecisions = jasmine.createSpy(
      "extractRenderableDecisions"
    );
    extractPageWideScopeDecisions = jasmine.createSpy(
      "extractPageWideScopeDecisions"
    );
  });

  it("should execute DOM ACTION decisions and return rest of decisions when renderDecisions is true", () => {
    const views = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    extractRenderableDecisions.and.returnValue([
      renderableDecisions,
      nonRenderableDecisions
    ]);
    extractPageWideScopeDecisions.and.returnValue([
      pageWideScopeDecisions,
      views
    ]);

    const expectedResult = {
      decisions: nonRenderableDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    const renderDecisions = true;
    const onResponse = createOnResponseHandler({
      storeViews,
      extractRenderableDecisions,
      extractPageWideScopeDecisions,
      executeDecisions,
      showContainers
    });

    const result = onResponse({ renderDecisions, response });

    expect(extractRenderableDecisions).toHaveBeenCalledWith(
      unprocessedDecisions
    );
    expect(extractPageWideScopeDecisions).toHaveBeenCalledWith(
      renderableDecisions
    );
    expect(storeViews).toHaveBeenCalledWith(views);
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(result).toEqual(expectedResult);
  });

  it("should not trigger executeDecisions, but should return all decisions when renderDecisions is false", () => {
    extractRenderableDecisions.and.returnValue([
      renderableDecisions,
      nonRenderableDecisions
    ]);
    extractPageWideScopeDecisions.and.returnValue([
      pageWideScopeDecisions,
      viewDecisions
    ]);
    const expectedResult = {
      decisions: PAGE_WIDE_SCOPE_DECISIONS
    };
    response.getPayloadsByType.and.returnValue(PAGE_WIDE_SCOPE_DECISIONS);

    const renderDecisions = false;
    const onResponse = createOnResponseHandler({
      storeViews,
      extractRenderableDecisions,
      extractPageWideScopeDecisions,
      executeDecisions,
      showContainers
    });

    const result = onResponse({ renderDecisions, response });

    expect(extractPageWideScopeDecisions).not.toHaveBeenCalled();
    expect(extractRenderableDecisions).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });
  it("should trigger showContainers if personalization payload is empty and return empty array", () => {
    const expectedResult = {
      decisions: []
    };
    response.getPayloadsByType.and.returnValue([]);

    const renderDecisions = false;
    const onResponse = createOnResponseHandler({
      storeViews,
      extractRenderableDecisions,
      extractPageWideScopeDecisions,
      executeDecisions,
      showContainers
    });
    const result = onResponse({ renderDecisions, response });

    expect(showContainers).toHaveBeenCalled();
    expect(extractRenderableDecisions).not.toHaveBeenCalled();
    expect(extractPageWideScopeDecisions).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("shouldn't store any viewDecision", () => {
    extractRenderableDecisions.and.returnValue([
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
      nonRenderableDecisions
    ]);
    extractPageWideScopeDecisions.and.returnValue([pageWideScopeDecisions, {}]);

    const expectedResult = {
      decisions: nonRenderableDecisions
    };
    response.getPayloadsByType.and.returnValue(PAGE_WIDE_SCOPE_DECISIONS);
    const renderDecisions = true;
    const onResponse = createOnResponseHandler({
      storeViews,
      extractRenderableDecisions,
      extractPageWideScopeDecisions,
      executeDecisions,
      showContainers
    });

    const result = onResponse({ renderDecisions, response });

    expect(extractRenderableDecisions).toHaveBeenCalledWith(
      PAGE_WIDE_SCOPE_DECISIONS
    );
    expect(extractPageWideScopeDecisions).toHaveBeenCalledWith(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(storeViews).not.toHaveBeenCalled();
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(result).toEqual(expectedResult);
  });
});

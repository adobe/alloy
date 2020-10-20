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
import { DOM_ACTION } from "../../../../../src/components/Personalization/constants/schema";
import PAGE_WIDE_SCOPE from "../../../../../src/components/Personalization/constants/scope";

describe("Personalization::onResponseHandler", () => {
  const renderableDecisions = [
    ...PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
    ...CART_VIEW_DECISIONS,
    ...PRODUCTS_VIEW_DECISIONS
  ];
  // const viewDecisions = CART_VIEW_DECISIONS.concat(PRODUCTS_VIEW_DECISIONS);
  const nonRenderableDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS;
  const unprocessedDecisions = [
    ...PAGE_WIDE_SCOPE_DECISIONS,
    ...CART_VIEW_DECISIONS,
    ...PRODUCTS_VIEW_DECISIONS
  ];
  const pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;

  let viewCache;
  let decisionsExtractor;
  let executeDecisions;
  let executeCachedViewDecisions;
  let showContainers;
  let response;
  let personalization;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    personalization = jasmine.createSpyObj("personalization", [
      "isRenderDecisions",
      "getViewName"
    ]);
    decisionsExtractor = jasmine.createSpyObj("decisionsExtractor", [
      "groupDecisionsBySchema",
      "groupDecisionsByScope"
    ]);
    viewCache = jasmine.createSpyObj("viewCache", ["storeViews"]);
    executeCachedViewDecisions = jasmine.createSpy(
      "executeCachedViewDecisions"
    );
    executeDecisions = jasmine.createSpy("executeDecisions");
    showContainers = jasmine.createSpy("showContainers");
  });

  it("should execute DOM ACTION decisions and return rest of decisions when renderDecisions is true", () => {
    const views = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      schemaDecisions: renderableDecisions,
      otherDecisions: nonRenderableDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      scopeDecisions: pageWideScopeDecisions,
      otherScopeDecisions: views
    });

    const expectedResult = {
      decisions: nonRenderableDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalization.isRenderDecisions.and.returnValue(true);
    personalization.getViewName.and.returnValue(undefined);
    const onResponse = createOnResponseHandler({
      viewCache,
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({ personalization, response });

    expect(decisionsExtractor.groupDecisionsBySchema).toHaveBeenCalledWith({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    expect(decisionsExtractor.groupDecisionsByScope).toHaveBeenCalledWith({
      decisions: renderableDecisions,
      scope: PAGE_WIDE_SCOPE
    });
    expect(viewCache.storeViews).toHaveBeenCalledWith(views);
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("should execute DOM ACTION decisions for page wide and for view and return rest of decisions when renderDecisions is true and a viewName is provided", () => {
    const views = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      schemaDecisions: renderableDecisions,
      otherDecisions: nonRenderableDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      scopeDecisions: pageWideScopeDecisions,
      otherScopeDecisions: views
    });

    const expectedResult = {
      decisions: nonRenderableDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalization.isRenderDecisions.and.returnValue(true);
    personalization.getViewName.and.returnValue("cart");
    const onResponse = createOnResponseHandler({
      viewCache,
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({ personalization, response });

    expect(decisionsExtractor.groupDecisionsBySchema).toHaveBeenCalledWith({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    expect(decisionsExtractor.groupDecisionsByScope).toHaveBeenCalledWith({
      decisions: renderableDecisions,
      scope: PAGE_WIDE_SCOPE
    });
    expect(viewCache.storeViews).toHaveBeenCalledWith(views);
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).toHaveBeenCalledWith({
      viewName: "cart"
    });
    expect(result).toEqual(expectedResult);
  });

  it("should return pageWide decisions, form based and the view decisions when renderDecisions is false and a viewName is provided", () => {
    const views = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };

    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      schemaDecisions: renderableDecisions,
      otherDecisions: nonRenderableDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      scopeDecisions: pageWideScopeDecisions,
      otherScopeDecisions: views
    });
    const expectedResult = {
      decisions: [
        ...pageWideScopeDecisions,
        ...nonRenderableDecisions,
        ...views.cart
      ]
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);

    personalization.isRenderDecisions.and.returnValue(false);
    personalization.getViewName.and.returnValue("cart");

    const onResponse = createOnResponseHandler({
      viewCache,
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({ personalization, response });

    expect(viewCache.storeViews).toHaveBeenCalledWith(views);
    expect(showContainers).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();

    expect(result).toEqual(expectedResult);
  });

  it("should trigger showContainers if personalization payload is empty and return empty array", () => {
    const expectedResult = {
      decisions: []
    };
    response.getPayloadsByType.and.returnValue([]);
    personalization.isRenderDecisions.and.returnValue(false);
    personalization.getViewName.and.returnValue("cart");

    const onResponse = createOnResponseHandler({
      viewCache,
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });
    const result = onResponse({ personalization, response });

    expect(showContainers).toHaveBeenCalled();
    expect(decisionsExtractor.groupDecisionsBySchema).not.toHaveBeenCalled();
    expect(decisionsExtractor.groupDecisionsByScope).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("shouldn't store any viewDecision", () => {
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      schemaDecisions: PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
      otherDecisions: nonRenderableDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      scopeDecisions: pageWideScopeDecisions,
      otherScopeDecisions: {}
    });
    const expectedResult = {
      decisions: nonRenderableDecisions
    };
    response.getPayloadsByType.and.returnValue(PAGE_WIDE_SCOPE_DECISIONS);
    personalization.isRenderDecisions.and.returnValue(true);
    personalization.getViewName.and.returnValue(undefined);

    const onResponse = createOnResponseHandler({
      viewCache,
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({ personalization, response });

    expect(viewCache.storeViews).not.toHaveBeenCalled();
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });
});

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
  const domActionDecisions = [
    ...PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
    ...CART_VIEW_DECISIONS,
    ...PRODUCTS_VIEW_DECISIONS
  ];
  // const viewDecisions = CART_VIEW_DECISIONS.concat(PRODUCTS_VIEW_DECISIONS);
  const nonDomActionDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS;
  const unprocessedDecisions = [
    ...PAGE_WIDE_SCOPE_DECISIONS,
    ...CART_VIEW_DECISIONS,
    ...PRODUCTS_VIEW_DECISIONS
  ];
  const pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;

  let decisionsExtractor;
  let executeDecisions;
  let executeCachedViewDecisions;
  let showContainers;
  let response;
  let personalizationDetails;
  let decisionsDeferred;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName"
    ]);
    decisionsExtractor = jasmine.createSpyObj("decisionsExtractor", [
      "groupDecisionsBySchema",
      "groupDecisionsByScope"
    ]);
    decisionsDeferred = jasmine.createSpyObj("decisionsDeferred", [
      "defer",
      "reject",
      "resolve"
    ]);
    executeDecisions = jasmine.createSpy("executeDecisions");
    showContainers = jasmine.createSpy("showContainers");
    executeCachedViewDecisions = jasmine.createSpy(
      "executeCachedViewDecisions"
    );
  });

  it("should execute DOM ACTION decisions and return rest of decisions when renderDecisions is true", () => {
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      domActionDecisions,
      nonDomActionDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    });

    const expectedResult = {
      decisions: nonDomActionDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue(undefined);
    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });

    expect(decisionsExtractor.groupDecisionsBySchema).toHaveBeenCalledWith({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    expect(decisionsExtractor.groupDecisionsByScope).toHaveBeenCalledWith({
      decisions: domActionDecisions,
      scope: PAGE_WIDE_SCOPE
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("should execute DOM ACTION decisions for page wide and for view and return rest of decisions when renderDecisions is true and a viewName is provided", () => {
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      domActionDecisions,
      nonDomActionDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    });

    const expectedResult = {
      decisions: nonDomActionDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");
    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(decisionsExtractor.groupDecisionsBySchema).toHaveBeenCalledWith({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    expect(decisionsExtractor.groupDecisionsByScope).toHaveBeenCalledWith({
      decisions: domActionDecisions,
      scope: PAGE_WIDE_SCOPE
    });

    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).toHaveBeenCalledWith({
      viewName: "cart"
    });
    expect(result).toEqual(expectedResult);
  });

  it("should return pageWide decisions, form based and the view decisions when renderDecisions is false and a viewName is provided", () => {
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };

    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      domActionDecisions,
      nonDomActionDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    });
    const expectedResult = {
      decisions: [
        ...pageWideScopeDecisions,
        ...nonDomActionDecisions,
        ...nonPageWideScopeDecisions.cart
      ]
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);

    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue("cart");

    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });

    expect(showContainers).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(result).toEqual(expectedResult);
  });

  it("should trigger showContainers if personalizationDetails payload is empty and return empty array", () => {
    const expectedResult = {
      decisions: []
    };
    response.getPayloadsByType.and.returnValue([]);
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue("cart");

    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });
    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith({});
    expect(showContainers).toHaveBeenCalled();
    expect(decisionsExtractor.groupDecisionsBySchema).not.toHaveBeenCalled();
    expect(decisionsExtractor.groupDecisionsByScope).not.toHaveBeenCalled();
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("shouldn't store any viewDecision", () => {
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      domActionDecisions: PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
      nonDomActionDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      pageWideScopeDecisions,
      nonPageWideScopeDecisions: {}
    });
    const expectedResult = {
      decisions: nonDomActionDecisions
    };
    response.getPayloadsByType.and.returnValue(PAGE_WIDE_SCOPE_DECISIONS);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue(undefined);

    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });

    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith({});
    expect(result).toEqual(expectedResult);
  });

  it("shouldn't trigger executeCachedViewDecisions when viewName is empty", () => {
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    decisionsExtractor.groupDecisionsBySchema.and.returnValue({
      domActionDecisions,
      nonDomActionDecisions
    });
    decisionsExtractor.groupDecisionsByScope.and.returnValue({
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    });

    const expectedResult = {
      decisions: nonDomActionDecisions
    };
    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("");
    const onResponse = createOnResponseHandler({
      decisionsExtractor,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers
    });

    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(decisionsExtractor.groupDecisionsBySchema).toHaveBeenCalledWith({
      decisions: unprocessedDecisions,
      schema: DOM_ACTION
    });
    expect(decisionsExtractor.groupDecisionsByScope).toHaveBeenCalledWith({
      decisions: domActionDecisions,
      scope: PAGE_WIDE_SCOPE
    });

    expect(showContainers).toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });
});

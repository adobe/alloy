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
  PRODUCTS_VIEW_DECISIONS,
  REDIRECT_PAGE_WIDE_SCOPE_DECISION
} from "./responsesMock/eventResponses";
import createOnResponseHandler from "../../../../../src/components/Personalization/createOnResponseHandler";

describe("Personalization::onResponseHandler", () => {
  const nonDomActionDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS;
  const unprocessedDecisions = [
    ...PAGE_WIDE_SCOPE_DECISIONS,
    ...CART_VIEW_DECISIONS,
    ...PRODUCTS_VIEW_DECISIONS
  ];
  const pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;

  let groupDecisions;
  let autoRenderingHandler;
  let nonRenderingHandler;
  let showContainers;
  let response;
  let personalizationDetails;
  let decisionsDeferred;
  let handleRedirectDecisions;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName"
    ]);
    groupDecisions = jasmine.createSpy();
    decisionsDeferred = jasmine.createSpyObj("decisionsDeferred", [
      "defer",
      "reject",
      "resolve"
    ]);
    autoRenderingHandler = jasmine.createSpy("autoRenderingHandler");
    showContainers = jasmine.createSpy("showContainers");
    nonRenderingHandler = jasmine.createSpy("nonRenderingHandler");
    handleRedirectDecisions = jasmine.createSpy("handleRedirectDecisions");
  });

  it("should trigger autoRenderingHandler when renderDecisions is true", () => {
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    groupDecisions.and.returnValues({
      redirectDecisions: [],
      pageWideScopeDecisions,
      viewDecisions: nonPageWideScopeDecisions,
      nonAutoRenderableDecisions: nonDomActionDecisions
    });

    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue(undefined);
    const onResponse = createOnResponseHandler({
      groupDecisions,
      nonRenderingHandler,
      autoRenderingHandler,
      handleRedirectDecisions,
      showContainers
    });

    onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(autoRenderingHandler).toHaveBeenCalledWith({
      viewName: undefined,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions: nonDomActionDecisions
    });
  });
  it("should trigger nonRenderingHandler when renderDecisions is false", () => {
    const nonPageWideScopeDecisions = {
      products: PRODUCTS_VIEW_DECISIONS
    };
    groupDecisions.and.returnValues({
      redirectDecisions: [],
      pageWideScopeDecisions,
      viewDecisions: nonPageWideScopeDecisions,
      nonAutoRenderableDecisions: nonDomActionDecisions
    });

    response.getPayloadsByType.and.returnValue(unprocessedDecisions);
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue(undefined);
    const onResponse = createOnResponseHandler({
      groupDecisions,
      nonRenderingHandler,
      autoRenderingHandler,
      handleRedirectDecisions,
      showContainers
    });

    onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith(
      nonPageWideScopeDecisions
    );
    expect(nonRenderingHandler).toHaveBeenCalledWith({
      viewName: undefined,
      redirectDecisions: [],
      pageWideScopeDecisions,
      nonAutoRenderableDecisions: nonDomActionDecisions
    });
  });

  it("should trigger showContainers if personalizationDetails payload is empty and return empty array", () => {
    const expectedResult = {
      decisions: [],
      propositions: []
    };
    response.getPayloadsByType.and.returnValue([]);
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue("cart");

    const onResponse = createOnResponseHandler({
      groupDecisions,
      nonRenderingHandler,
      autoRenderingHandler,
      handleRedirectDecisions,
      showContainers
    });
    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith({});
    expect(showContainers).toHaveBeenCalled();
    expect(groupDecisions).not.toHaveBeenCalled();
    expect(nonRenderingHandler).not.toHaveBeenCalled();
    expect(autoRenderingHandler).not.toHaveBeenCalled();
    expect(result).toEqual(expectedResult);
  });

  it("should trigger redirect handler when renderDecisions is true and there are redirectDecisions", () => {
    const payload = [
      ...PAGE_WIDE_SCOPE_DECISIONS,
      ...CART_VIEW_DECISIONS,
      ...PRODUCTS_VIEW_DECISIONS,
      ...REDIRECT_PAGE_WIDE_SCOPE_DECISION
    ];
    const nonPageWideScopeDecisions = {
      cart: CART_VIEW_DECISIONS,
      products: PRODUCTS_VIEW_DECISIONS
    };
    groupDecisions.and.returnValues({
      redirectDecisions: REDIRECT_PAGE_WIDE_SCOPE_DECISION,
      pageWideScopeDecisions,
      viewDecisions: nonPageWideScopeDecisions,
      nonAutoRenderableDecisions: nonDomActionDecisions
    });

    response.getPayloadsByType.and.returnValue(payload);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");
    const onResponse = createOnResponseHandler({
      groupDecisions,
      nonRenderingHandler,
      autoRenderingHandler,
      handleRedirectDecisions,
      showContainers
    });
    const result = onResponse({
      decisionsDeferred,
      personalizationDetails,
      response
    });
    expect(decisionsDeferred.resolve).toHaveBeenCalledWith({});
    expect(showContainers).not.toHaveBeenCalled();
    expect(nonRenderingHandler).not.toHaveBeenCalled();
    expect(autoRenderingHandler).not.toHaveBeenCalled();
    expect(result).toEqual(undefined);
  });
});

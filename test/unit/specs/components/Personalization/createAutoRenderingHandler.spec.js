/*
Copyright 2021 Adobe. All rights reserved.
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
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  SCOPES_FOO1_FOO2_DECISIONS
} from "./responsesMock/eventResponses";
import createAutoRenderingHandler from "../../../../../src/components/Personalization/createAutoRenderingHandler";

describe("Personalization::createAutoRenderingHandler", () => {
  let viewCache;
  let executeDecisions;
  let executeCachedViewDecisions;
  let showContainers;
  let pageWideScopeDecisions;
  let nonAutoRenderableDecisions;
  let logger;

  beforeEach(() => {
    pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;
    nonAutoRenderableDecisions = SCOPES_FOO1_FOO2_DECISIONS;
    showContainers = jasmine.createSpy("showContainers");
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
    executeDecisions = jasmine.createSpy("executeDecisions");
    executeCachedViewDecisions = jasmine.createSpy(
      "executeCachedViewDecisions"
    );
    logger = jasmine.createSpyObj("logger", ["warn"]);
  });

  it("it should fetch decisions from cache when viewName is present", () => {
    const viewName = "cart";
    const promise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };
    viewCache.getView.and.returnValue(promise);

    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers,
      logger
    });

    const result = autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    });
    expect(viewCache.getView).toHaveBeenCalledWith("cart");
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(executeCachedViewDecisions).toHaveBeenCalledWith({
      viewName,
      viewDecisions: CART_VIEW_DECISIONS
    });
    expect(showContainers).toHaveBeenCalled();

    result.decisions.forEach(decision => {
      expect(decision.renderAttempted).toBeUndefined();
    });

    result.propositions.forEach(proposition => {
      if (proposition.scope === "__view__" || proposition.scope === viewName) {
        expect(proposition.renderAttempted).toEqual(true);
      } else {
        expect(proposition.renderAttempted).toEqual(false);
      }
    });
  });

  it("it should execute page wide scope decisions when no viewName", () => {
    const viewName = undefined;
    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      executeCachedViewDecisions,
      showContainers,
      logger
    });

    const result = autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    });

    result.decisions.forEach(decision => {
      expect(decision.renderAttempted).toBeUndefined();
    });

    result.propositions.forEach(proposition => {
      if (proposition.scope === "__view__") {
        expect(proposition.renderAttempted).toEqual(true);
      } else {
        expect(proposition.renderAttempted).toEqual(false);
      }
    });

    expect(viewCache.getView).not.toHaveBeenCalled();
    expect(executeCachedViewDecisions).not.toHaveBeenCalled();
    expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
    expect(showContainers).toHaveBeenCalled();
  });
});

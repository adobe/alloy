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
  REDIRECT_PAGE_WIDE_SCOPE_DECISION,
  SCOPES_FOO1_FOO2_DECISIONS
} from "./responsesMock/eventResponses";
import createNonRenderingHandler from "../../../../../src/components/Personalization/createNonRenderingHandler";

describe("Personalization::createNonRenderingHandler", () => {
  let viewCache;
  let pageWideScopeDecisions;
  let formBasedComposedDecisions;
  let cartViewDecisions;
  let redirectDecisions;
  let logger;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn"]);
    redirectDecisions = REDIRECT_PAGE_WIDE_SCOPE_DECISION;
    cartViewDecisions = CART_VIEW_DECISIONS;
    pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;
    formBasedComposedDecisions = SCOPES_FOO1_FOO2_DECISIONS;
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
  });

  it("it should fetch decisions from cache when viewName is present", () => {
    const viewName = "cart";
    const promise = {
      then: callback => callback(cartViewDecisions)
    };
    viewCache.getView.and.returnValue(promise);

    const nonRenderingHandler = createNonRenderingHandler({
      viewCache,
      logger
    });

    nonRenderingHandler({
      viewName,
      redirectDecisions,
      pageWideScopeDecisions,
      formBasedComposedDecisions
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledWith("cart");
      expect(result.decisions.length).toBe(5);
      expect(logger.warn).toHaveBeenCalled();
      result.decisions.forEach(decision => {
        expect(decision.renderAttempted).toBeUndefined();
      });
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toEqual(false);
      });
    });
  });

  it("it should not trigger viewCache when no viewName", () => {
    const viewName = undefined;
    const nonRenderingHandler = createNonRenderingHandler({
      viewCache,
      logger
    });

    nonRenderingHandler({
      viewName,
      redirectDecisions,
      pageWideScopeDecisions,
      formBasedComposedDecisions
    }).then(result => {
      expect(viewCache.getView).not.toHaveBeenCalled();
      expect(result.decisions.length).toBe(4);
      expect(logger.warn).toHaveBeenCalled();
      result.decisions.forEach(decision => {
        expect(decision.renderAttempted).toBeUndefined();
      });
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toEqual(false);
      });
    });
  });
});

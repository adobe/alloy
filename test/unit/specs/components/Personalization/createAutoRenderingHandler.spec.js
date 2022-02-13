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
  let showContainers;
  let collect;
  let pageWideScopeDecisions;
  let nonAutoRenderableDecisions;

  beforeEach(() => {
    showContainers = jasmine.createSpy("showContainers");
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
    collect = jasmine.createSpy("collect");
    executeDecisions = jasmine.createSpy("executeDecisions");
    pageWideScopeDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS;
    nonAutoRenderableDecisions = SCOPES_FOO1_FOO2_DECISIONS;
  });

  it("it should fetch decisions from cache when viewName is present", () => {
    const viewName = "cart";
    const executeViewDecisionsPromise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };
    const executePageWideScopeDecisionsPromise = {
      then: callback =>
        callback(PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS)
    };

    viewCache.getView.and.returnValue(Promise.resolve(CART_VIEW_DECISIONS));
    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      showContainers,
      collect
    });

    executeDecisions.and.returnValues(
      executePageWideScopeDecisionsPromise,
      executeViewDecisionsPromise
    );

    return autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledWith("cart");
      expect(executeDecisions).toHaveBeenCalledTimes(2);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
      );
      expect(executeDecisions.calls.all()[1].args[0]).toEqual(
        CART_VIEW_DECISIONS
      );

      result.decisions.forEach(decision => {
        expect(decision.renderAttempted).toBeUndefined();
      });

      result.propositions.forEach(proposition => {
        if (
          proposition.scope === "__view__" ||
          proposition.scope === viewName
        ) {
          expect(proposition.renderAttempted).toEqual(true);
        } else {
          expect(proposition.renderAttempted).toEqual(false);
        }
      });

      expect(collect).toHaveBeenCalledTimes(2);
      expect(collect.calls.all()[0].args[0]).toEqual({
        decisionsMeta: PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
      });
      expect(collect.calls.all()[1].args[0]).toEqual({
        decisionsMeta: CART_VIEW_DECISIONS,
        viewName
      });
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should execute page wide scope decisions when no viewName", () => {
    const viewName = undefined;
    const executePageWideScopeDecisionsPromise = {
      then: callback =>
        callback(PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS)
    };
    executeDecisions.and.returnValue(executePageWideScopeDecisionsPromise);

    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      collect,
      showContainers
    });

    return autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    }).then(result => {
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
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
      expect(collect).toHaveBeenCalledTimes(1);
      expect(collect).toHaveBeenCalledWith({
        decisionsMeta: pageWideScopeDecisions
      });
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it calls collect if cache returns empty array for a view", () => {
    const viewName = "cart";
    const promise = {
      then: callback => callback([])
    };
    const executePageWideScopeDecisionsPromise = {
      then: callback =>
        callback(PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS)
    };
    const executeViewDecisionsPromise = {
      then: callback => callback([])
    };
    viewCache.getView.and.returnValue(promise);
    executeDecisions.and.returnValues(
      executePageWideScopeDecisionsPromise,
      executeViewDecisionsPromise
    );

    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      showContainers,
      collect
    });

    return autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledWith("cart");
      expect(executeDecisions).toHaveBeenCalledWith(pageWideScopeDecisions);
      expect(showContainers).toHaveBeenCalled();
      expect(collect).toHaveBeenCalledTimes(2);
      expect(collect.calls.all()[1].args[0]).toEqual({
        decisionsMeta: [],
        viewName
      });
      result.decisions.forEach(decision => {
        expect(decision.renderAttempted).toBeUndefined();
      });

      result.propositions.forEach(proposition => {
        if (
          proposition.scope === "__view__" ||
          proposition.scope === viewName
        ) {
          expect(proposition.renderAttempted).toEqual(true);
        } else {
          expect(proposition.renderAttempted).toEqual(false);
        }
      });
    });
  });

  it("it shouldn't call collect when no pageWideScopeDecisions and no viewName", () => {
    const viewName = undefined;

    const executePageWideScopeDecisionsPromise = {
      then: callback => callback([])
    };

    executeDecisions.and.returnValue(executePageWideScopeDecisionsPromise);

    const autorenderingHandler = createAutoRenderingHandler({
      viewCache,
      executeDecisions,
      showContainers,
      collect
    });

    return autorenderingHandler({
      viewName,
      pageWideScopeDecisions,
      nonAutoRenderableDecisions
    }).then(result => {
      expect(viewCache.getView).not.toHaveBeenCalled();
      expect(showContainers).toHaveBeenCalled();
      expect(collect).not.toHaveBeenCalled();
      result.decisions.forEach(decision => {
        expect(decision.renderAttempted).toBeUndefined();
      });

      result.propositions.forEach(proposition => {
        if (
          proposition.scope === "__view__" ||
          proposition.scope === viewName
        ) {
          expect(proposition.renderAttempted).toEqual(true);
        } else {
          expect(proposition.renderAttempted).toEqual(false);
        }
      });
    });
  });
});

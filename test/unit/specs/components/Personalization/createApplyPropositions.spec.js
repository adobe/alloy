/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import "jasmine-expect";
import {
  CART_VIEW_DECISIONS,
  SCOPES_FOO1_FOO2_DECISIONS
} from "./responsesMock/eventResponses";
import createApplyPropositions from "../../../../../src/components/Personalization/createApplyPropositions";

describe("Personalization::createApplyPropositions", () => {
  let viewCache;
  let executeDecisions;
  let showContainers;

  beforeEach(() => {
    showContainers = jasmine.createSpy("showContainers");
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
    executeDecisions = jasmine.createSpy("executeDecisions");
  });

  it("it should get view decisions from cache and render them when viewName is provided", () => {
    const viewName = "cart";
    const executeViewDecisionsPromise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };

    executeDecisions.and.returnValue(executeViewDecisionsPromise);
    viewCache.getView.and.returnValue(Promise.resolve(CART_VIEW_DECISIONS));

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      viewName
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledWith("cart");
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        CART_VIEW_DECISIONS
      );

      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        expect(proposition.scope).toEqual(viewName);
        expect(proposition.items).toBeArrayOfObjects();
      });

      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should still show containers if there are no view decisions in the view cache", () => {
    let noDecisions;
    const viewName = "cart";
    const executeViewDecisionsPromise = {
      then: callback => callback(noDecisions)
    };

    executeDecisions.and.returnValue(executeViewDecisionsPromise);
    viewCache.getView.and.returnValue(Promise.resolve(noDecisions));

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      viewName
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledWith("cart");
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(noDecisions);
      expect(result.propositions).toBeEmptyArray();
      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should execute user-provided propositions for non-SPA pages", () => {
    const executeDecisionsPromise = {
      then: callback => callback(SCOPES_FOO1_FOO2_DECISIONS)
    };

    executeDecisions.and.returnValue(executeDecisionsPromise);

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: SCOPES_FOO1_FOO2_DECISIONS
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledTimes(0);
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        SCOPES_FOO1_FOO2_DECISIONS
      );

      const expectedScopes = SCOPES_FOO1_FOO2_DECISIONS.map(
        proposition => proposition.scope
      );
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        expect(expectedScopes).toContain(proposition.scope);
        expect(proposition.items).toBeArrayOfObjects();
      });

      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should execute user-provided propositions and not execute view decisions if user sends both propositions and viewName", () => {
    const executeDecisionsPromise = {
      then: callback => callback(SCOPES_FOO1_FOO2_DECISIONS)
    };

    executeDecisions.and.returnValue(executeDecisionsPromise);

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: SCOPES_FOO1_FOO2_DECISIONS,
      viewName: "cart"
    }).then(result => {
      expect(viewCache.getView).toHaveBeenCalledTimes(0);
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        SCOPES_FOO1_FOO2_DECISIONS
      );

      const expectedScopes = SCOPES_FOO1_FOO2_DECISIONS.map(
        proposition => proposition.scope
      );
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        expect(expectedScopes).toContain(proposition.scope);
        expect(proposition.items).toBeArrayOfObjects();
      });

      expect(showContainers).toHaveBeenCalled();
    });
  });

  it("it should return an empty propositions promise if viewName and propositions are both empty values", () => {
    const executeDecisionsPromise = {
      then: callback => callback(SCOPES_FOO1_FOO2_DECISIONS)
    };

    executeDecisions.and.returnValue(executeDecisionsPromise);

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions: [],
      viewName: ""
    }).then(result => {
      expect(result).toEqual({ propositions: [] });
      expect(viewCache.getView).toHaveBeenCalledTimes(0);
      expect(executeDecisions).toHaveBeenCalledTimes(0);
      expect(showContainers).toHaveBeenCalledTimes(0);
    });
  });

  it("it should merge metadata with propositions that have html-content-item schema", () => {
    const propositions = [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
        scope: "home",
        items: [
          {
            id: "442358",
            schema: "https://ns.adobe.com/personalization/dom-action",
            data: {
              type: "click",
              format: "application/vnd.adobe.target.dom-action",
              selector: "#root"
            }
          }
        ]
      },
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
        scope: "home",
        items: [
          {
            id: "442359",
            schema: "https://ns.adobe.com/personalization/html-content-item",
            data: {
              content: "<p>Some custom content for the home page</p>",
              format: "text/html",
              id: "1202448"
            }
          }
        ]
      }
    ];
    const metadata = {
      home: {
        selector: "#home-item1",
        actionType: "setHtml"
      }
    };

    const applyPropositions = createApplyPropositions({
      viewCache,
      executeDecisions,
      showContainers
    });

    return applyPropositions({
      propositions,
      metadata
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(2);
      executedPropositions.forEach(proposition => {
        expect(proposition.scope).toEqual("home");
        expect(proposition.items.length).toEqual(1);
        if (proposition.items[0].id === "442358") {
          expect(proposition.items[0].data.selector).toEqual("#root");
          expect(proposition.items[0].data.type).toEqual("click");
        } else if (proposition.items[0].id === "442359") {
          expect(proposition.items[0].data.selector).toEqual("#home-item1");
          expect(proposition.items[0].data.type).toEqual("setHtml");
        }
      });
      expect(viewCache.getView).toHaveBeenCalledTimes(0);
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(showContainers).toHaveBeenCalled();
    });
  });
});

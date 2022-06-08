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
  MIXED_PROPOSITIONS,
  PAGE_WIDE_SCOPE_DECISIONS
} from "./responsesMock/eventResponses";
import createApplyPropositions from "../../../../../src/components/Personalization/createApplyPropositions";
import clone from "../../../../../src/utils/clone";

const METADATA = {
  home: {
    selector: "#home-item1",
    actionType: "setHtml"
  }
};

describe("Personalization::createApplyPropositions", () => {
  let executeDecisions;

  beforeEach(() => {
    executeDecisions = jasmine.createSpy("executeDecisions");
  });

  it("it should return an empty propositions promise if propositions is empty array", () => {
    executeDecisions.and.returnValue(
      Promise.resolve(PAGE_WIDE_SCOPE_DECISIONS)
    );

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: []
    }).then(result => {
      expect(result).toEqual({ propositions: [] });
      expect(executeDecisions).toHaveBeenCalledTimes(0);
    });
  });

  it("it should apply user-provided dom-action schema propositions", () => {
    executeDecisions.and.returnValue(
      Promise.resolve(PAGE_WIDE_SCOPE_DECISIONS)
    );
    const expectedExecuteDecisionsPropositions = clone(
      PAGE_WIDE_SCOPE_DECISIONS
    );
    expectedExecuteDecisionsPropositions[0].items = expectedExecuteDecisionsPropositions[0].items.slice(
      0,
      2
    );

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: PAGE_WIDE_SCOPE_DECISIONS
    }).then(result => {
      expect(executeDecisions).toHaveBeenCalledTimes(1);
      expect(executeDecisions.calls.all()[0].args[0]).toEqual(
        expectedExecuteDecisionsPropositions
      );

      const expectedScopes = expectedExecuteDecisionsPropositions.map(
        proposition => proposition.scope
      );
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        expect(expectedScopes).toContain(proposition.scope);
        expect(proposition.items).toBeArrayOfObjects();
        expect(proposition.items.length).toEqual(2);
      });
    });
  });

  it("it should merge metadata with propositions that have html-content-item schema", () => {
    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS,
      metadata: METADATA
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(3);
      executedPropositions.forEach(proposition => {
        expect(proposition.items.length).toEqual(1);
        if (proposition.items[0].id === "442358") {
          expect(proposition.scope).toEqual("home");
          expect(proposition.items[0].data.selector).toEqual("#root");
          expect(proposition.items[0].data.type).toEqual("click");
        } else if (proposition.items[0].id === "442359") {
          expect(proposition.scope).toEqual("home");
          expect(proposition.items[0].data.selector).toEqual("#home-item1");
          expect(proposition.items[0].data.type).toEqual("setHtml");
        }
      });
      expect(executeDecisions).toHaveBeenCalledTimes(1);
    });
  });

  it("it should drop items with html-content-item schema when there is no metadata", () => {
    const propositions = [
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
          },
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
      }
    ];

    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions
    }).then(result => {
      expect(result.propositions.length).toEqual(1);
      expect(result.propositions[0].items.length).toEqual(1);
      expect(result.propositions[0].items[0].id).toEqual("442358");
      expect(result.propositions[0].renderAttempted).toBeTrue();
    });
  });

  it("it should return renderAttempted = true on resulting propositions", () => {
    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS
    }).then(result => {
      expect(result.propositions.length).toEqual(2);
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
      });
    });
  });

  it("it should ignore propositions with __view__ scope that have already been rendered", () => {
    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS
    }).then(result => {
      expect(result.propositions.length).toEqual(2);
      result.propositions.forEach(proposition => {
        expect(proposition.renderAttempted).toBeTrue();
        if (proposition.scope === "__view__") {
          expect(proposition.items[0].id).not.toEqual("442358");
        } else {
          expect(proposition.scope).toEqual("home");
        }
      });
    });
  });

  it("it should ignore items with unsupported schemas", () => {
    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const expectedItemIds = ["442358", "442359"];

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    return applyPropositions({
      propositions: MIXED_PROPOSITIONS
    }).then(() => {
      const executedPropositions = executeDecisions.calls.all()[0].args[0];
      expect(executedPropositions.length).toEqual(2);
      executedPropositions.forEach(proposition => {
        expect(proposition.items.length).toEqual(1);
        proposition.items.forEach(item => {
          expect(expectedItemIds.includes(item.id));
        });
      });
    });
  });

  it("it should not mutate original propositions", () => {
    executeDecisions.and.returnValue(Promise.resolve(MIXED_PROPOSITIONS));

    const applyPropositions = createApplyPropositions({
      executeDecisions
    });

    const originalPropositions = clone(MIXED_PROPOSITIONS);
    return applyPropositions({
      propositions: originalPropositions,
      metadata: METADATA
    }).then(result => {
      let numReturnedPropositions = 0;
      expect(originalPropositions).toEqual(MIXED_PROPOSITIONS);
      result.propositions.forEach(proposition => {
        const original = originalPropositions.find(
          originalProposition => originalProposition.id === proposition.id
        );
        if (original) {
          numReturnedPropositions += 1;
          expect(proposition).not.toBe(original);
        }
      });
      expect(numReturnedPropositions).toEqual(3);
    });
  });
});
